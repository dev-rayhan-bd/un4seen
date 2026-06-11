import QueryBuilder from '../../builder/QueryBuilder';
import { TProduct } from './product.interface';
import { Product } from './product.model';

const createProductIntoDB = async (payload: TProduct) => {
  return await Product.create(payload);
};

const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const productQuery = new QueryBuilder(Product.find({ isDeleted: false }), query)
    .search(['title', 'brand', 'category'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();


  const modifiedResult = result.map(product => {
    let discount = null;
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    }
    return {
      ...product.toObject(),
      discountPercentage: discount ? `-${discount}%` : null
    };
  });

  return { meta, result: modifiedResult };
};

export const ProductServices = {
  createProductIntoDB,
  getAllProductsFromDB
};