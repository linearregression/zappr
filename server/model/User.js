import Sequelize from 'sequelize'

import { db } from './Database'
import { deserializeJson, flattenToJson } from './properties'

/**
 * Zappr/Github user. Has many {@link Repository}.
 */
export default db.define('user', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: false
  },
  json: {
    type: Sequelize.JSONB,
    allowNull: false,
    get: deserializeJson('json')
  }
}, {
  instanceMethods: {
    flatten: flattenToJson
  },
  schema: db.schema
})
