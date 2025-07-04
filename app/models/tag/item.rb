# Copyright (C) 2012-2025 Zammad Foundation, https://zammad-foundation.org/

class Tag::Item < ApplicationModel
  validates   :name, presence: true, format: { without: %r{,|\*} }
  before_save :fill_namedowncase

  has_many :tags, foreign_key: 'tag_item_id',
                  inverse_of:  :tag_item,
                  dependent:   :destroy

  scope :recommended, lambda {
    left_outer_joins(:tags)
      .group(:id)
      .reorder('COUNT(tags.tag_item_id) DESC, name ASC')

  }

  scope :filter_by_name, lambda { |query|
    where('name_downcase LIKE ?', "%#{SqlHelper.quote_like(query.strip.downcase)}%")
      .reorder(name: :asc)
  }

  scope :filter_or_recommended, lambda { |query|
    query.blank? ? recommended : filter_by_name(query)
  }

=begin

lookup by name and create tag item

tag_item = Tag::Item.lookup_by_name_and_create('some tag')

=end

  def self.lookup_by_name_and_create(name)
    name.strip!

    tag_item = Tag::Item.lookup(name: name)
    return tag_item if tag_item

    Tag::Item.create(name: name)
  end

=begin

rename tag items

Tag::Item.rename(
  id: existing_tag_item_to_rename,
  name: 'new tag item name',
  updated_by_id: current_user.id,
)

=end

  def self.rename(data)

    new_tag_name         = data[:name].strip
    old_tag_item         = Tag::Item.find(data[:id])
    already_existing_tag = Tag::Item.lookup(name: new_tag_name)

    # check if no rename is needed
    return true if new_tag_name == old_tag_item.name

    # merge old with new tag if already existing
    if already_existing_tag

      # re-assign old tag to already existing tag
      Tag.where(tag_item_id: old_tag_item.id).each do |tag|

        # check if tag already exists on object
        if Tag.exists?(tag_object_id: tag.tag_object_id, o_id: tag.o_id, tag_item_id: already_existing_tag.id)
          Tag.tag_remove(
            tag_object_id: tag.tag_object_id,
            o_id:          tag.o_id,
            tag_item_id:   old_tag_item.id,
          )
          next
        end

        # re-assign
        tag_object = Tag::Object.lookup(id: tag.tag_object_id)
        tag.tag_item_id = already_existing_tag.id
        tag.save

        # touch reference objects
        Tag.touch_reference_by_params(
          object: tag_object.name,
          o_id:   tag.o_id,
        )
      end

      # delete not longer used tag
      old_tag_item.destroy
      return true
    end

    update_referenced_objects(old_tag_item.name, new_tag_name)

    # update new tag name
    old_tag_item.name = new_tag_name
    old_tag_item.save

    # touch reference objects
    Tag.where(tag_item_id: old_tag_item.id).each do |tag|
      tag_object = Tag::Object.lookup(id: tag.tag_object_id)
      Tag.touch_reference_by_params(
        object: tag_object.name,
        o_id:   tag.o_id,
      )
    end

    true
  end

=begin

remove tag item (destroy with reverences)

Tag::Item.remove(id)

=end

  def self.remove(id)

    # search for references, destroy and touch
    Tag.where(tag_item_id: id).each do |tag|
      tag_object = Tag::Object.lookup(id: tag.tag_object_id)
      tag.destroy
      Tag.touch_reference_by_params(
        object: tag_object.name,
        o_id:   tag.o_id,
      )
    end
    Tag::Item.find(id).destroy
    true
  end

  def fill_namedowncase
    self.name_downcase = name.downcase
    true
  end

=begin

Update referenced objects such as triggers, overviews, schedulers, and postmaster filters

Specifically, the following fields are updated:

Overview.condition
Trigger.condition   Trigger.perform
Job.condition       Job.perform
                    PostmasterFilter.perform

=end

  def self.update_referenced_objects(old_name, new_name)
    all_objects.each do |object|
      changed = false

      changed |= update_tag_values(object.condition, old_name, new_name) if object.has_attribute?(:condition)
      changed |= update_tag_values(object.perform, old_name, new_name)   if object.has_attribute?(:perform)

      object.save if changed
    end
  end

  def self.all_objects
    Overview.all + Trigger.all + Job.all + PostmasterFilter.all
  end

  def self.update_tag_values(data, old_name, new_name)
    return false if !data

    return update_conditions_array(data[:conditions], old_name, new_name) if data.key?(:conditions)

    update_condition_hash(data, old_name, new_name)
  end

  def self.update_conditions_array(conditions, old_name, new_name)
    changed = false

    conditions.each do |condition|
      if condition.key?(:conditions)
        # Nested condition group
        changed |= update_conditions_array(condition[:conditions], old_name, new_name)
      else
        next if !tag_condition?(condition[:name])
        next if !tag_includes?(condition[:value], old_name)

        condition[:value] = update_name(condition[:value], old_name, new_name)
        changed = true
      end
    end

    changed
  end

  def self.update_condition_hash(hash, old_name, new_name)
    changed = false

    hash.each do |key, condition|
      next if !tag_condition?(key)
      next if !tag_includes?(condition[:value], old_name)

      condition[:value] = update_name(condition[:value], old_name, new_name)
      changed = true
    end

    changed
  end

  def self.update_name(value, old_name, new_name)
    tags = value.split(', ')
    return new_name if tags.one?

    tags.map { |t| t == old_name ? new_name : t }.join(', ')
  end

  def self.tag_condition?(key)
    %w[ticket.tags x-zammad-ticket-tags].include?(key)
  end

  def self.tag_includes?(value, tag)
    value.to_s.split(', ').include?(tag)
  end
end
