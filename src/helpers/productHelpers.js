export const getProductStatus = (product) => {

  const qty = Number(product.qty);
  const minStock = Number(product.minStock);

  if (qty === 0) {
    return "out_of_stock";
  } else if (qty <= minStock) {
    return "low_stock";
  } else {
    return "in_stock";
  }
};

export const validateProduct = (editData) => {

  if (!editData.name.trim()) {
    return {
      valid: false,
      message: "Product name is required",
    };
  }

  if (editData.price <= 0) {
    return {
      valid: false,
      message: "Price must be greater than 0",
    };
  }

  if (editData.qty < 0) {
    return {
      valid: false,
      message: "Quantity cannot be negative",
    };
  }

  if (!editData.category) {
    return {
      valid: false,
      message: "Category is required",
    };
  }

  if (!editData.supplier.trim()) {
    return {
      valid: false,
      message: "Supplier is required",
    };
  }

  if (!editData.minStock || editData.minStock < 0) {
    return {
      valid: false,
      message: "Minimum Stock is required",
    };
  }

  return {
    valid: true,
  };
};