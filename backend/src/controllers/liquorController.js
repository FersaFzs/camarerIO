import Liquor from '../models/Liquor.js';

export const getLiqueurs = async (req, res) => {
  const liqueurs = await Liquor.find().sort({ name: 1 });
  res.json(liqueurs);
};

export const createLiqueur = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio' });
    const liquor = new Liquor({ name });
    await liquor.save();
    res.status(201).json(liquor);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear licor', error: err.message });
  }
};

export const deleteLiqueur = async (req, res) => {
  try {
    const { id } = req.params;
    await Liquor.findByIdAndDelete(id);
    res.json({ message: 'Licor eliminado' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar licor', error: err.message });
  }
}; 