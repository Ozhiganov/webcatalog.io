import Sequelize from 'sequelize';

import sequelize from '../sequelize';

const Draft = sequelize.define('draft', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  name: {
    type: Sequelize.STRING,
  },
  url: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
});

export default Draft;
