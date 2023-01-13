const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({
  })
  res.status(200).json({nbHits:products.length, products })
} 
const getAllProducts = async (req, res) => {
  const {name, featured, company, sort, fields,numericFilters} = req.query
  const queryObject = {}

  if(name){
    queryObject.name = {$regex:name, $options:'i'}
  }
  if(featured){
    queryObject.featured = featured === 'true' ? true : false
  }
  if(company){
    queryObject.company = company
  }
  if(numericFilters){
    const operatorMap = {
      '>':'$gt',
      '>=':'$gte',
      '=':'$eq',
      '<=':'$lte',
      '<':'$lt',
    }
    const regex = /\b(<|<=|=|>=|>)\b/g
    let filters = numericFilters.replace( 
      regex, 
      (match) => `-${operatorMap[match]}-`
    )
    const options = ['price', 'rating']
    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-')
     if(options.includes(field)){
       queryObject[field] = {[operator]:Number(value)}
     }
    })
  }

  console.log(queryObject)
  let result = Product.find(queryObject)
  if(sort){
    const sortList = sort.split(',').join(' ')
    result = result.sort(sortList)
  } else {
    result = result.sort('name')
  }
  if(fields){
    const fieldsList = fields.split(',').join(' ')
    result = result.select(fieldsList)
  }
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page -1) * limit;
  result = result.skip(skip).limit(limit)

  const products = await result
  res.status(200).json({nbHits:products.length, products})
} 

module.exports = { 
  getAllProducts, 
  getAllProductsStatic
}