import SoftDrink from '../models/SoftDrink.js';

export const getSoftDrinks = async (req, res) => {
  const softDrinks = await SoftDrink.find().sort({ name: 1 });
  res.json(softDrinks);
};

export const createSoftDrink = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio' });
    const softDrink = new SoftDrink({ name });
    await softDrink.save();
    res.status(201).json(softDrink);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear refresco', error: err.message });
  }
};

export const deleteSoftDrink = async (req, res) => {
  try {
    const { id } = req.params;
    await SoftDrink.findByIdAndDelete(id);
    res.json({ message: 'Refresco eliminado' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar refresco', error: err.message });
  }
}; 