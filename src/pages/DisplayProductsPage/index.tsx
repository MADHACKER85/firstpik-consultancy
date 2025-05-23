import React,{useState,useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '../../firebase/firebaseConfig';

const firestore = getFirestore(app);

interface ProductDetail {
  id: string;
  name: string;
  price: string;
  description: string;
  mainImage: string;
  extraImages: string[];
  category: string;
}

function ProductDetails() {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const docRef = doc(firestore, "products", id!);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const productData = { id: docSnap.id, ...docSnap.data() } as ProductDetail;
        setProduct(productData);
        setMainImage(productData.mainImage);
      } else {
        setError("Product not found");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!product) return <div className="text-center p-4">Product not found</div>;

  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-[10px] py-4">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="flex flex-col-reverse md:flex-row gap-4">
              {/* Thumbnail Images (Left Side) */}
              <div className="flex md:flex-col gap-4 md:w-1/5 md:h-[400px] justify-center items-center">
                {/* Main Image Thumbnail */}
                <div className="w-24 h-24 transform transition-all duration-300 hover:scale-110 flex items-center justify-center">
                  <div className="w-20 h-20 overflow-hidden"> {/* Added container with overflow hidden */}
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className={`w-full h-full object-contain rounded-sm cursor-pointer ${
                        mainImage === product.mainImage ? 'border-2 border-blue-500' : 'border-2 border-gray-200'
                      }`}
                      onMouseEnter={() => setMainImage(product.mainImage)}
                    />
                  </div>
                </div>

                {/* Extra Images */}
                {product.extraImages?.map((img, index) => (
                  <div 
                    key={index} 
                    className="w-24 h-24 transform transition-all duration-300 hover:scale-110 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 overflow-hidden"> {/* Added container with overflow hidden */}
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className={`w-full h-full object-contain rounded-sm cursor-pointer ${
                          mainImage === img ? 'border-2 border-blue-500' : 'border-2 border-gray-200'
                        }`}
                        onMouseEnter={() => setMainImage(img)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Image (Right Side) */}
             
              <div className="md:w-4/5 h-[400px]">
              <div className='w-full h-full rounded-lg border border-gray-100'>
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain transition duration-1000"
                />
              </div>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl text-blue-600 mb-4">₹{product.price}</p>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;