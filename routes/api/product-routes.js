const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

router.get('/', async (req, res) => {
  try {
    // Find all products and include associated Category and Tag data
    const products = await Product.findAll({
      include: [
        { model: Category },
        { model: Tag, through: ProductTag },
      ],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Find a single product by its `id` and include associated Category and Tag data
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Tag, through: ProductTag },
      ],
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json(product);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    // Create a new product
    const newProduct = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: newProduct.id,
          tag_id,
        };
      });

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update product data
    const [rowsUpdated, updatedProducts] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
    });

    if (rowsUpdated === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (req.body.tagIds && req.body.tagIds.length) {
      const existingProductTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const existingTagIds = existingProductTags.map(({ tag_id }) => tag_id);
      const newTagIds = req.body.tagIds.filter(
        (tag_id) => !existingTagIds.includes(tag_id)
      );

      const productTagIdArr = newTagIds.map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });

      await Promise.all([
        ProductTag.destroy({
          where: {
            product_id: req.params.id,
            tag_id: existingTagIds,
          },
        }),
        ProductTag.bulkCreate(productTagIdArr),
      ]);
    } else {
      await ProductTag.destroy({ where: { product_id: req.params.id } });
    }

    res.status(200).json(updatedProducts[0]);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete one product by its `id` value
    const deletedProduct = await Product.destroy({
      where: { id: req.params.id },
    });

    if (!deletedProduct) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json({ message: 'Product deleted successfully' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
