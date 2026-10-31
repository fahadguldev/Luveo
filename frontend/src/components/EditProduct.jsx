import { useState, useEffect } from 'react';
import { PRODUCT_CATEGORY_OPTIONS } from '../lib/productCategories';
import { useParams } from 'react-router-dom';
import { Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import AdminBackLink from './AdminBackLink';

const EditProduct = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [editableFields, setEditableFields] = useState({
        name: '', price: '', description: '', stock: '', size: '', category: '', SKU: '', tag: '',
    });
    const [images, setImages] = useState([]);

    const showFeedback = (msg, isError = false) => {
        setFeedback({ msg, isError });
        setTimeout(() => setFeedback(null), 4000);
    };

    const getAuthToken = () => {
        const directToken = localStorage.getItem('token');
        if (directToken) return directToken.replace(/^Bearer\s+/i, '');

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return (user?.token || '').replace(/^Bearer\s+/i, '');
        } catch {
            return '';
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/product/get-product/${id}`);
                const data = await response.json();
                if (data.product) {
                    setProduct(data.product);
                    setEditableFields({
                        name: data.product.name,
                        price: data.product.price,
                        description: data.product.description,
                        stock: data.product.stock,
                        category: String(data.product.category || '').toLowerCase(),
                        SKU: data.product.SKU,
                        tag: data.product.tag,
                        size: data.product.size,
                    });
                    setImages(data.product.colors?.[0]?.images || []);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };
        fetchProduct();
    }, [id]);

    const handleEdit = (field, value) => {
        setEditableFields(prev => ({
            ...prev,
            [field]: field === "price" || field === "stock" ? (value === "" ? "" : parseInt(value, 10) || "") : value
        }));
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveSelectedImage = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateProduct = async () => {
        setLoading(true);
        const formData = new FormData();

        const productData = {
            ...product,
            ...editableFields,
            price: Number(editableFields.price) || 0,
            stock: Number(editableFields.stock) || 0,
            category: String(editableFields.category || '').trim().toLowerCase(),
            discountPrice: Number(product.discountPrice) || 0,
            technicalSpecs: product.technicalSpecs || {},
            features: Array.isArray(product.features) ? product.features : [],
            colors: (product.colors || []).map((color) => ({
                name: color.name,
                hex: color.hex,
            })),
        };

        formData.append('productData', JSON.stringify(productData));
        formData.append('existingColorImages_0', JSON.stringify(images));
        selectedFiles.forEach(file => formData.append('colorImages_0', file));

        try {
            const token = getAuthToken();
            if (!token) {
                showFeedback("Authentication token missing. Please sign in.", true);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/edit-product/${id}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                credentials: "include"
            });

            if (response.ok) {
                showFeedback("Piece specifications updated successfully!");
                const updatedProduct = await response.json();
                setProduct(updatedProduct.product);
                setImages(updatedProduct.product.colors?.[0]?.images || []);
                setSelectedFiles([]);
            } else {
                const errorPayload = await response.json().catch(() => ({}));
                showFeedback(errorPayload?.message || 'Failed to update product', true);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showFeedback('Network error while updating piece', true);
        } finally {
            setLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-3 border-[#9B5A2B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-stone-500 font-serif">Loading piece specifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBF9F5] text-stone-900 px-4 sm:px-8 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <AdminBackLink />

                <div className="pb-4 border-b border-stone-200">
                    <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9B5A2B] mb-1">
                        <span>Specification Revision</span>
                    </div>
                    <h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900">
                        Edit Atelier Piece
                    </h1>
                    <p className="text-xs text-stone-500 font-light mt-0.5">
                        Update hide details, pricing tier, dimensions, and gallery photos.
                    </p>
                </div>

                {feedback && (
                    <div
                        className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                            feedback.isError
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                    >
                        {feedback.isError ? (
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                        <span>{feedback.msg}</span>
                    </div>
                )}

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {Object.entries(editableFields).map(([key, value]) => (
                            <div key={key} className={key === 'description' ? 'sm:col-span-2' : ''}>
                                <label className="font-mono uppercase text-[10px] text-stone-500 block mb-1">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                {key === 'category' ? (
                                    <select
                                        name={key}
                                        value={value}
                                        onChange={(e) => handleEdit(key, e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs text-stone-900"
                                    >
                                        <option value="">Select category</option>
                                        {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : key === 'description' ? (
                                    <textarea
                                        rows={3}
                                        name={key}
                                        value={value}
                                        onChange={(e) => handleEdit(key, e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs text-stone-900"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        name={key}
                                        value={value}
                                        onChange={(e) => handleEdit(key, e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#9B5A2B] text-xs text-stone-900"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Image Gallery */}
                    <div className="pt-4 border-t border-stone-100 space-y-3">
                        <label className="font-mono uppercase text-[10px] text-stone-500 block">
                            Atelier Photography Gallery
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {images.map((image, index) => (
                                <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-stone-200">
                                    <img src={image} alt="Product" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2">
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-medium text-stone-700 cursor-pointer transition">
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Upload Additional Photos</span>
                                <input type="file" multiple onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-3">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-amber-300 ring-2 ring-amber-200">
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSelectedImage(index)}
                                            className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={handleUpdateProduct}
                            disabled={loading}
                            className="w-full py-3.5 bg-[#0D0C0B] text-[#FBF9F5] rounded-xl font-medium tracking-wide hover:bg-stone-800 transition shadow"
                        >
                            {loading ? "Updating Piece..." : "Save Product Specifications"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
