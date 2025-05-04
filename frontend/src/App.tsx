import React, { useEffect, useState } from 'react';
import Card from './components/Card.tsx';
import { ProductConverter } from './utils/ProductConverter';
import { Product, SelectOption } from './types';
import SearchBar from './components/SearchBar.tsx';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectValue, setSelectValue] = useState<string>('all');

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  useEffect(() => {
    const filtered = products.filter((product) => {
      if (selectValue === SelectOption.Increase) {
        return product.history[0].price < product.history[product.history.length - 1].price;
      } else if (selectValue === SelectOption.Decrease) {
        return product.history[0].price > product.history[product.history.length - 1].price;
      }
      return true; // Show all products if "all" is selected
    });
    setFilteredProducts(filtered);
  }, [selectValue, products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://jueet.github.io/price-tracker/data/precios.json');
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        const productsArray = ProductConverter.toArray(data);
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } catch (err) {
        setError('Error loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto my-8">
        <div className="loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto my-8">
        <div className="error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <section className='text-center my-8'>
        <h1 className="text-4xl font-bold mb-4">Price Trackert</h1>
        <p className="text-gray-600 mb-4">
          Search for products by name or category.
        </p>
      </section>
      <section>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectValue={selectValue}
          setSelectValue={setSelectValue} />
      </section>
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProductList;
