"use strict";

const relationType = {
  /**
   *
   * @param {import("../models/model-factory").Model} model
   * @param {import("../datasources/datasource").default} ds
   * @param {import("./index").relations[relation]} rel
   */
  oneToMany: async (model, ds, rel) => {
    const pk = model.id || model.getId();
    return ds.list({ [rel.foreignKey]: pk });
  },
  /**
   *
   * @param {import("../models").Model} model
   * @param {import("../datasources/datasource").default} ds
   * @param {import("./index").relations[relation]} config
   */
  manyToOne: async (model, ds, rel) => await ds.find(model[rel.foreignKey]),

  oneToOne(model, ds, rel) {
    return this.manyToOne(model, ds, rel);
  },
};

/**
 * Generate functions to retrieve related domain objects.
 * @param {import("./index").relations} relations
 * @param {*} dataSource
 */
export default function makeRelations(relations, dataSource) {
  if (Object.getOwnPropertyNames(relations).length < 1) return;

  return Object.keys(relations)
    .map(function (relation) {
      const rel = relations[relation];
      try {
        const ds = dataSource.getFactory().getDataSource(rel.modelName);
        if (!ds || !relationType[rel.type]) {
          console.warn("invalid relation", rel);
          return;
        }

        return {
          async [relation]() {
            return relationType[rel.type](this, ds, rel);
          },
        };
      } catch (e) {
        console.log(e);
      }
    })
    .reduce((c, p) => ({ ...p, ...c }));
}
