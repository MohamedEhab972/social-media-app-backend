import type { Filter } from "mongodb";
import type { HydratedDocument, Model, UpdateQuery } from "mongoose";

export class DatabaseRepository<T> {
  private model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(userData: T) {
    const user = new this.model(userData);
    return await user.save();
  }

  async findAll({
    select,
    populate,
    lean,
  }: {
    select?: string;
    populate?: string;
    lean?: boolean;
  } = {}): Promise<HydratedDocument<T>[]> {
    const query = this.model.find();
    if (select) {
      query.select(select);
    }
    if (populate) {
      query.populate(populate);
    }
    if (lean) {
      query.lean(lean);
    }
    return await query;
  }

  async findByID({
    id,
    select,
    populate,
    lean,
  }: {
    id: string;
    select?: string;
    populate?: string;
    lean?: boolean;
  }): Promise<HydratedDocument<T> | null> {
    const query = this.model.findById(id);
    if (select) {
      query.select(select);
    }
    if (populate) {
      query.populate(populate);
    }
    if (lean) {
      query.lean(lean);
    }
    return await query;
  }

  async findOne({
    filter,
    select,
    populate,
    lean,
  }: {
    filter: Omit<Filter<T>, "_id">;
    select?: string;
    populate?: string;
    lean?: boolean;
  }): Promise<HydratedDocument<T> | null> {
    const query = this.model.findOne(filter);
    if (select) {
      query.select(select);
    }
    if (populate) {
      query.populate(populate);
    }
    if (lean) {
      query.lean(lean);
    }
    return await query;
  }

  async update({
    filter,
    updateData,
    select,
    populate,
    lean,
  }: {
    filter: Omit<Filter<T>, "_id">;
    updateData: UpdateQuery<T>;
    select?: string;
    populate?: string;
    lean?: boolean;
  }): Promise<HydratedDocument<T> | null> {
    const query = this.model.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true, runValidators: true },
    );
    if (select) {
      query.select(select);
    }
    if (populate) {
      query.populate(populate);
    }
    if (lean) {
      query.lean(lean);
    }
    return await query;
  }
}
