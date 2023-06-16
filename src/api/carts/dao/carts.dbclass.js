import mongoose from 'mongoose';
import cartModel from "../models/carts.model.js"
import productModel from '../../products/models/products.model.js';

const prodJson = "./producto.json"

class Carts{
  static ultimo_id = 0
  constructor(){
    this.status = 0;
    this.statusMsg = "inicializado";
  }
  
  showStatusMsg = ()=>{
    return this.statusMsg;
  }
  
  getCarts = async() => {
    try {
      const carts = await cartModel.find()
      this.status = 1;
      this.statusMsg = 'Carritos recuperados';
      return carts
    } catch (err) {
      this.status = -1;
      this.statusMsg = `getCarts: ${err}`;
    }
  }
 
  ///FALTA
  addCart = async(cartLastId)=>{
    try {
      Carts.ultimo_id = cartLastId +1
      const cart_nuevo = {
        id: Carts.ultimo_id,
        products:[]
      }
      const process = await cartModel.create(cart_nuevo)
      this.status = 1;
      this.statusMsg = "Carrito agregado"
    } catch (err) {
      this.mensaje = `AddProduct: ${err}`;
    }
    
  }

  getCartById = async(id)=>{
    try {
      const isValidId = await cartModel.findOne({id:id})
      if(isValidId){
      const process = await cartModel.findOne({id:id}).lean().populate("products.product")
      this.status = 1;
      this.statusMsg = process
      return process
    }else{
      this.status = 1;
      this.statusMsg = "No existe un carrito con ese ID"
      return []
    }
      
    } catch (err) {
      this.mensaje = `Ocurrió un error en getProductsById: ${err}`
    }
  }

  addProductArray = async(idCart, arrayProd)=>{
    try {
      console.log(arrayProd)
      const carts = await cartModel.findOne({id:idCart})
      carts.products.push(...arrayProd)
      const process = await cartModel.updateOne({id:idCart}, carts)
        this.status = 1;
        this.statusMsg = carts
      
    } catch (err) {
      this.mensaje = `Ocurrió un error en getProductsById: ${err}`
    }
  }

  addCartProduct= async(idCart,idProd)=>{
    try {
      const carts = await cartModel.findOne({id:idCart})
      const product = await productModel.findOne({id:idProd})
      const isProductId= carts.products.some(prod=>JSON.stringify(prod.product) === JSON.stringify(product._id))
      if(!isProductId){
        carts.products.push({product:product._id, quantity:1})
        const process = await cartModel.updateOne({id:idCart}, carts)
        this.status = 1;
        this.statusMsg = process.modifiedCount === 0 ? this.statusMsg = "Producto no agregado": this.statusMsg = "Producto agregado"
      }else{
        carts.products.forEach((prod,index)=>{if(JSON.stringify(prod.product) === JSON.stringify(product._id)){
          return carts.products[index].quantity = carts.products[index].quantity +1
        }})
        const process = await cartModel.updateOne({id:idCart}, carts) 
        this.status = 1;
        this.statusMsg = process.modifiedCount === 0 ? this.statusMsg = "Producto no agregado": this.statusMsg = "Cantidad añadida" 
      }
      /* const cartsProducts = await cartModel.findOne({id:idCart}).populate("products.product")
      console.log(JSON.stringify(cartsProducts, null,'\t')) */
      
      
    } catch (error) {
      this.status = -1;
      this.statusMsg = `addCartProduct: ${err}`;
    }
  }
  addQuantityProducts = async(idCart,idProd,prodCant)=>{
    try {
      console.log(prodCant)
      const carts = await cartModel.findOne({id:idCart})
      const product = await productModel.findOne({id:idProd})
      const isProductId= carts.products.some(prod=>JSON.stringify(prod.product) === JSON.stringify(product._id))
      if(isProductId && prodCant){
        carts.products.forEach((prod,index)=>{if(JSON.stringify(prod.product) === JSON.stringify(product._id)){
          return carts.products[index].quantity = prodCant
        }})
        const process = await cartModel.updateOne({id:idCart}, carts) 
        this.status = 1;
        this.statusMsg = process.modifiedCount === 0 ? this.statusMsg = "Producto no agregado": this.statusMsg = "Cantidad añadida" 
      }else{
        "El producto no existe o la cantidad no es válida"
      }
      
    } catch (error) {
      this.status = -1;
      this.statusMsg = `addQuantityProducts: ${err}`;
    }
  }

  deleteCartProduct= async(idCart,idProd)=>{
    try {
      const product = await productModel.findOne({id:idProd})

      const carts = await cartModel.findOne({id:idCart})
      carts.products.forEach((prod, index)=>{if(JSON.stringify(prod.product) === JSON.stringify(product._id)){
        return carts.products.splice(index, 1)
      }}) 
      const process = await cartModel.updateOne({id:idCart}, carts)  ;
      this.status = 1;
      this.statusMsg = process.modifiedCount === 0 ? this.statusMsg = "El ID no existe": this.statusMsg = "Producto borrado";

    } catch (error) {
      this.status = -1;
      this.statusMsg = `addCartProduct: ${err}`;
    }
  }

  deleteAllProducts= async(idCart)=>{
    try {
      const carts = await cartModel.findOne({id:idCart})
      carts.products = []
      const process = await cartModel.updateOne({id:idCart}, carts)   ;
      this.status = 1;
      this.statusMsg = process.modifiedCount === 0 ? this.statusMsg = "El ID no existe": this.statusMsg = "Productos borrados";

    } catch (error) {
      this.status = -1;
      this.statusMsg = `addCartProduct: ${err}`;
    }
  }



  ///FALTA
  /* addCartProduct= async(idCart,idProd)=>{
    try {
      const filterId = this.cart.filter((cart)=> (cart.id === idCart)) 
      const filterOtherId = this.cart.filter((prod)=> (prod.id !== idCart))
      const products = JSON.parse(await fs.promises.readFile(prodJson, "utf-8"))
      const filterProdId = products.filter((prod)=> (prod.id === idProd)) 
  
      if (filterId.length === 0){
        return this.mensaje = "Error, no hay ningun carrito con esa Id"
      }else{
        if(filterProdId.length === 0){
          return this.mensaje = "Error, no hay ningun producto con esa Id"
        }else{
          const isProdRepeat = filterId[0].products.filter((prod)=>prod.product === filterProdId[0].id)
          if(isProdRepeat.length === 0){
            filterId[0].products.push({product:filterProdId[0].id,quantity:1})
            const nuevoArray = [...filterOtherId,...filterId]
            this.cart = nuevoArray
            const cadenaArchivo = JSON.stringify(nuevoArray)
            await fs.promises.writeFile(this.ruta, cadenaArchivo)
            this.mensaje = "Producto Añadido a Carrito"
            console.log("Producto Añadido a Carrito") 
            return filterId
          }else{
            filterId[0].products.map(function(prod){
              if(prod.product === filterProdId[0].id){
                prod.quantity = prod.quantity +1
              }
            })
            const nuevoArray = [...filterOtherId,...filterId]
            this.cart = nuevoArray
            const cadenaArchivo = JSON.stringify(nuevoArray)
            await fs.promises.writeFile(this.ruta, cadenaArchivo)
            this.mensaje = "Producto Añadido a Carrito"
            console.log("Producto Añadido a Carrito") 
            return filterId
          }
        }
      }
    } catch (error) {
      this.mensaje = `Ocurrió un error en addCartProduct: ${err}`
    }
  } */
}

export default Carts;