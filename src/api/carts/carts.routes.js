import { Router } from "express";
import Carts from "./dao/carts.dbclass.js";
import cartModel from "./models/carts.model.js";

const routerCart = Router();

const manager = new Carts()

///Agregar carrito
routerCart.post('/carts', async (req, res) => {
  try {
    const carts = await manager.getCarts();
    const cartIds = []
    carts.forEach((cart)=>{
     cartIds.push(cart.id)
    })
    const cartLastId= Math.max(...cartIds)
    const nuevoCart = await manager.addCart(cartLastId)
    res.status(200).send({estado:"ok", agregado:manager.showStatusMsg()})
  } catch (error) {
    res.status(404).send({estado:error}) 
  }
});

/// Ver un solo carrito y sus productos
routerCart.get('/carts/:cid', async (req, res) => {
  try {
    const id = parseInt(req.params.cid)
    const idCart = await manager.getCartById(id)
    const isValid = idCart.length !== 0?true:false
    res.render("carts",{products: idCart.products, id: id, isValid:isValid})
    /* res.status(200).send({estado:"ok", productos:manager.showStatusMsg()}) */
  } catch (error) {
    res.status(404).send({estado:error, msj:manager.showStatusMsg()})   
  }
});

///Agregar un array de Productos al carrito
routerCart.put('/carts/:cid', async (req, res) => {
  try {
    const idCart = parseInt(req.params.cid)
    const arrayProd = req.body
    const putArray = await manager.addProductArray(idCart,arrayProd)
    res.status(200).send({estado:"ok", productos:manager.showStatusMsg()})
  } catch (error) {
    res.status(404).send({estado:error})   
  }
});

///Agregar un producto al carrito
routerCart.post('/carts/:cid/products/:pid', async (req, res) => {
  try {
    const idCart = parseInt(req.params.cid)
    const idProd = parseInt(req.params.pid)
    const addProd = await manager.addCartProduct(idCart,idProd)
    res.status(200).send({estado:"ok", agregado:manager.showStatusMsg()})
  } catch (error){
    res.status(404).send({estado:manager.showStatusMsg()})
  }
});

///Modificar la cantidad de un producto del carrito
routerCart.put('/carts/:cid/products/:pid', async (req, res) => {
  try {
    const idCart = parseInt(req.params.cid)
    const idProd = parseInt(req.params.pid)
    const prodCant = req.body.quantity
    const addProd = await manager.addQuantityProducts(idCart,idProd, prodCant)
    res.status(200).send({estado:"ok", agregado:manager.showStatusMsg()})
  } catch (error){
    res.status(404).send({estado:manager.showStatusMsg()})
  }
});

///Eliminar un producto de carrito
routerCart.delete('/carts/:cid/products/:pid', async (req, res) => {
  try {
    const idCart = parseInt(req.params.cid)
    const idProd = parseInt(req.params.pid)
    const addProd = await manager.deleteCartProduct(idCart,idProd)
    res.status(200).send({estado:"ok", agregado:manager.showStatusMsg()})
  } catch (error) {
    res.status(404).send({estado:manager.showStatusMsg()})
  }
});

///Eliminar todos los productos del carrito
routerCart.delete('/carts/:cid', async (req, res) => {
  try {
    const idCart = parseInt(req.params.cid)
    const delProds = await manager.deleteAllProducts(idCart)
    res.status(200).send({estado:"ok", agregado:manager.showStatusMsg()})
  } catch (error) {
    res.status(404).send({estado:manager.showStatusMsg()})
  }
});

export default routerCart