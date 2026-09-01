const API_URL = 'http://localhost:8080/api/productos';

export const obtenerProductos = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al obtener los productos');
        return await response.json();
    } catch (error) {
        console.error("Error en el servicio de productos:", error);
        return [];
    }
};