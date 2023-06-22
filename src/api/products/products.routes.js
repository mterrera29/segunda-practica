import { Router } from "express";
import Products from './dao/products.dbclass.js';
import productModel from "./models/products.model.js";
import { __dirname } from "../../utils.js";

const router = Router();
const manager = new Products();

const validate = async (req, res, next) => {
  console.log(req.session.userValidated)
  if (req.session.userValidated) {
      next();
  } else {
      res.status(401).send({ status: 'ERR', error: 'No tiene autorización para realizar esta solicitud' });
  }
}
/// Ver todos los productos
router.get('/products', validate,  async (req,res)=>{
  if (req.session.user || req.session.userValidated) {
    try {
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let sort = parseInt(req.query.sort);
        let query = req.query.query;
        if(!page) page=1;
        if(!limit) limit=3;
        let sortFilter
        !sort? {} : sortFilter= {price:sort} 
        let categoryFilter
        !query? categoryFilter = {} : categoryFilter = {category:query}
        let result = await productModel.paginate(categoryFilter,{page,limit:limit,lean:true,sort:sortFilter})
        result.prevLink = result.hasPrevPage?`products?page=${result.prevPage}`:'';
        result.nextLink = result.hasNextPage?`products?page=${result.nextPage}`:'';
        result.isValid= !(page<=0||page>result.totalPages) 
        console.log(req.session)
        result.user = req.session
        res.render('products',result)
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err.message });
    }

} else {
    res.status(401).send({ status: 'ERR', error: 'No tiene autorización para realizar esta solicitud' });
}
  })

/// Traer sólo el producto con el id proporcionado
router.get('/products/:pid', validate, async (req, res) => {
    try {
        const id = parseInt(req.params.pid)
        const products = await manager.getProductById(id);
        res.status(200).send({ status: 'OK', msj: manager.showStatusMsg(), data:products });
    } catch (err) {
        res.status(500).send({ status: 'ERR', error: err });
    }
  });

/// Agregar un nuevo producto
router.post('/products', async (req, res) => {
  try {
    await manager.addProduct(req.body);
    if (manager.checkStatus() === 1) {
      res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
    } else {
      res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
    }
  } catch (err) {
    res.status(500).send({ status: 'ERR', error: err });
  }
});

/// Tomar un producto y actualizarlo por los campos enviados desde body
router.put('/products/:pid', validate, async (req, res) => {
  try {
      await manager.updateProduct(req.params.pid, req.body);
  
      if (manager.checkStatus() === 1) {
          res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
      } else {
          res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
      }
  } catch (err) {
      res.status(500).send({ status: 'ERR', error: err });
  }
});

///eliminar el producto con el pid indicado
router.delete('/products/:pid', validate, async(req, res) => {
  try {
      await manager.deleteProduct(req.params.pid);
  
      if (manager.checkStatus() === 1) {
          res.status(200).send({ status: 'OK', msg: manager.showStatusMsg() });
      } else {
          res.status(400).send({ status: 'ERR', error: manager.showStatusMsg() });
      }
  } catch (err) {
      res.status(500).send({ status: 'ERR', error: err });
  }
});

export default router