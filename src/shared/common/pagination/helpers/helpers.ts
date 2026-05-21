export const delay = (ms =1000): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const normoliseString = (str: string): string => str.replace(/[\s\-]/g, '').toUpperCase();