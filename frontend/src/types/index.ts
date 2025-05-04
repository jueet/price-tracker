export type ProductRaw = {
    title: string;
    url: string;
    history: Array<{
        price: string;
        timestamp: string;
    }>;
};

export type Product = ProductRaw & { id: string };