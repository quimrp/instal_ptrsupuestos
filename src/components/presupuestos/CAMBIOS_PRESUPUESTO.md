const cargarPresupuesto = async () => {
try {
if (params.id && typeof params.id === 'string') {
console.log('EditarPage: Intentando cargar presupuesto con ID:', params.id); // NUEVO LOG
const data = await dataService.getPresupuesto(params.id);
console.log('EditarPage: Datos recibidos de getPresupuesto:', data); // NUEVO LOG
if (data) {
// ... resto del código
}
}
} catch (error) {
console.error('Error al cargar el presupuesto:', error);
}
};
