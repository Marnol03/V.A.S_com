import { Sequelize, DataTypes } from 'sequelize'

const sequelize = new Sequelize('digitalerkontor', 'root', 'mariadb123', {
  dialect: 'mariadb',
  dialectOptions: {
    connectTimeout: 10000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

const Customer = sequelize.define('customers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.BIGINT(20), // unicode timestamp in milliseconds
    allowNull: false
  },
  created_at: {
    type: DataTypes.BIGINT(20), // unicode timestamp in milliseconds
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'customers',
  underscored: true,
  freezeTableName: true
})

const Items = sequelize.define('items', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imgurl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'items',
  underscored: true,
  freezeTableName: true
})

function getAllItems () {
  return Items.findAll()
}
function getItem (id) {
  return Items.findByPk(id)
}

function getAll () {
  return Customer.findAll()
}
function get (id) {
  return Customer.findByPk(id)
}
function remove (id) {
  return Customer.destroy({ where: { id } })
}
function save (customer) {
  return Customer.upsert(customer)
}

export {
  getAllItems,
  getItem,
  getAll,
  get,
  remove,
  save,
  Customer,
  Items
}
