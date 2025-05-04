import React from 'react';
import FormatDiff from './FormatDiff';
import DateDisplayer from './DateDisplayer';
import { Product } from '../types';

type Props = {
  product: Product;
};

const ProductCard: React.FC<Props> = ({ product }) => {
  const title = product.title.length > 32 ? product.title.slice(0, 32) + '...' : product.title;

  const firstEntry = product.history[0];
  const latestEntry = product.history[product.history.length - 1];
  const prevEntry = product.history.length > 1 ? product.history[product.history.length - 2] : null;

  const parsePrice = (p: string) =>
    parseFloat((p || '').replace(/[^0-9.-]+/g, ''));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const firstPrice = firstEntry ? parsePrice(firstEntry.price) : null;
  const latestPrice = latestEntry ? parsePrice(latestEntry.price) : null;
  const prevPrice = prevEntry ? parsePrice(prevEntry.price) : null;

  const diffFirstPrev = prevPrice !== null && firstPrice !== null ? prevPrice - firstPrice : 0;
  const diffPrevLatest = latestPrice !== null && prevPrice !== null ? latestPrice - prevPrice : 0;
  const diffFirstLatest = latestPrice !== null && firstPrice !== null ? latestPrice - firstPrice : 0;

  const firstDate = firstEntry ? formatDate(firstEntry.timestamp) : 'N/A';
  const latestDate = latestEntry ? formatDate(latestEntry.timestamp) : 'N/A';
  const prevDate = prevEntry ? formatDate(prevEntry.timestamp) : 'N/A';

  return (
    <div className="card bg-base-100 w-full shadow-sm rounded border border-gray-300">
      <div className="bg-base-500 p-4">
        <h2 className="text-xl font-bold">
          <a
            className="hover:text-emerald-500"
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>
        </h2>
        <div className="mt-8">
          <div className="flex flex-col">
            <div className="flex justify-between">
              <span>First Price:</span>
              <span className="flex">
                <span className='font-bold'>{firstPrice}</span>
                <FormatDiff className="ms-1" diff={diffFirstPrev} />
              </span>
            </div>
            <div className="flex justify-between">
              <span>Latest Price:</span>
              <span className="flex">
                <span className='font-bold'>{latestPrice}</span>
                <FormatDiff className="ms-1" diff={diffFirstLatest} />
              </span>
            </div>
            <div className="flex justify-between">
              <span>Previous Price:</span>
              <span className="flex">
                <span className='font-bold'>{prevPrice}</span>
                <FormatDiff className="ms-1" diff={diffPrevLatest} />
              </span>
            </div>
          </div>
          <div className="flex flex-col mt-4">
            <DateDisplayer date={firstDate} title="First" />
            <DateDisplayer date={prevDate} title="Previous" />
            <DateDisplayer date={latestDate} title="Latest" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
