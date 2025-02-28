import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import app from '../../firebase/firebaseConfig';
import { Product } from '../../types/product'; 

const CategoryProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { category } = useParams();
  const [stockStatus, setStockStatus] = useState<'available' | 'outOfStock'>('available');
  const firestore = getFirestore(app);

  const navigate = useNavigate();

  // Convert URL parameter to database category format
  const getCategoryName = (urlCategory: string | undefined) => {
    switch(urlCategory) {
      case 'waterbottle':
        return 'WATER_BOTTLES';
      case 'cashewnuts':
        return 'CASHEW_NUTS';
      case 'choppingboard':
        return 'CHOPPING_BOARD';
      default:
        return '';
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(firestore, 'products');
      const q = query(
        productsRef, 
        where('category', '==', getCategoryName(category))
      );
      const querySnapshot = await getDocs(q);
      
      const productsData: Product[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          price: data.price,
          description: data.description,
          mainImageUrl: data.mainImage, 
          category: data.category,
          productID: data.productID,
          timestamp: data.timestamp?.toDate()
        };
      });
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="w-full px-2 sm:px-4 mt-14">
      {products.length === 0 ? (
        <div className="text-center text-gray-500">
          No products found in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex flex-row sm:flex-col 
              bg-white rounded-sm 
              hover:shadow-lg transition-shadow duration-300 
              cursor-pointer overflow-hidden
              h-[150px] sm:h-auto
              w-full sm:w-[270px]
              mx-auto"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {/* Left Side - Image Container */}
              <div className="
                w-1/2 sm:w-full 
                h-full sm:h-[250px]
                relative
              ">
                <img
                  src={product.mainImageUrl} // Updated to use mainImageUrl
                  alt={product.name}
                  className="
                    w-full 
                    h-full
                    object-contain
                    bg-gray-200
                  "
                  loading="lazy"
                />
              </div>

              {/* Right Side - Product Details */}
              <div className="
                w-1/2 sm:w-full
                p-3 sm:p-4 
                flex flex-col 
                justify-between
                bg-white
              ">
                {/* Product Name */}
                <div>
                  <h3 className="
                    font-medium 
                    text-gray-900 
                    text-sm sm:text-lg 
                    line-clamp-2
                    mb-1
                  ">
                    {product.name}
                  </h3>
                </div>

                {/* Price and Stock Status */}
                <div className="
                  mt-auto
                  flex flex-col gap-2
                  sm:flex-row sm:items-center 
                  sm:justify-between 
                  pt-2 
                  border-t border-gray-100
                ">
                  {/* Price */}
                  <div className="
                    text-base sm:text-lg 
                    font-bold 
                    text-gray-900
                  ">
                    ₹{product.price}
                  </div>

                  {/* Stock Status */}
                  <span className={`
                    px-2 py-1 pr-[6px]
                    rounded
                    text-[10px] sm:text-xs
                    font-medium
                    inline-block
                    ${stockStatus === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {stockStatus === 'available' ? 'In Stock' : 'Out of Stocks'} 
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;