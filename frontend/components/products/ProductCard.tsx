import { useState } from 'react';
import { Heart, ShoppingCart, MapPin, Calendar } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  price: number;
  wholesalePrice: number;
  image: string;
  stock: number;
  expiryDays: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const stockPercentage = Math.min(100, Math.max(0, (product.stock / 100) * 100));
  const isLowStock = product.stock < 10;

  return (
    <div
      className="card-premium overflow-hidden h-full flex flex-col group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-56">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="badge-accent shadow-lg">
            {product.category}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 group-hover:text-red-500'
            }`}
          />
        </button>

        {/* Stock Status Badge */}
        {isLowStock && (
          <div className="absolute bottom-4 left-4">
            <span className="badge-warning shadow-lg animate-pulse">
              Осталось: {product.stock}
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-[#1A2F23] mb-1 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#1A2F23] group-hover:to-[#D4AF37] group-hover:bg-clip-text transition-all">
          {product.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin size={14} />
          <span className="font-medium">{product.location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        {/* Stock Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">Наличие</span>
            <span className="text-xs font-bold text-[#1A2F23]">{product.stock} шт</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-500"
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4 pb-4 border-b border-gray-200/50">
          <div className="flex items-end gap-2 mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#1A2F23]">{product.price}</span>
              <span className="text-xs text-gray-500">₸</span>
            </div>
            {product.wholesalePrice && product.wholesalePrice < product.price && (
              <div className="flex items-baseline gap-1 ml-auto">
                <span className="text-sm font-medium text-gray-500 line-through">{product.wholesalePrice}₸</span>
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Опт</span>
              </div>
            )}
          </div>
        </div>

        {/* Expiry Info */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Calendar size={14} className="text-orange-500" />
          <span className={`font-medium ${
            product.expiryDays <= 5 ? 'text-red-600' : 'text-orange-600'
          }`}>
            Срок: {product.expiryDays} дн.
          </span>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full flex items-center justify-center gap-2 btn-primary">
          <ShoppingCart size={18} />
          <span className="font-semibold">В корзину</span>
        </button>
      </div>
    </div>
  );
}