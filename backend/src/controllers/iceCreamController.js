import IceCream from '../models/IceCream.js';

export const getIceCreams = async (req, res) => {
  const iceCreams = await IceCream.find().sort({ name: 1 });
  res.json(iceCreams);
};

export const createIceCream = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre es obligatorio' });
    const iceCream = new IceCream({ name });
    await iceCream.save();
    res.status(201).json(iceCream);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear sabor de helado', error: err.message });
  }
};

export const deleteIceCream = async (req, res) => {
  try {
    const { id } = req.params;
    await IceCream.findByIdAndDelete(id);
    res.json({ message: 'Sabor de helado eliminado' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar sabor de helado', error: err.message });
  }
}; 