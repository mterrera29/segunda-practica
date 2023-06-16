import fs from "fs"

const prodJson = "./producto.json"

class CartManager{
  static ultimo_id = 0
  constructor(ruta){
    this.ruta = ruta
    this.cart = []
  }

  #readCartsFromFile = async () => {
    const carts = await fs.promises.readFile(this.ruta, "utf-8")
    return carts === "" ? [] : JSON.parse(carts)
  }
  
  showMensaje = ()=>{
    return this.mensaje
  }
  
  getCarts = async() => {
    try {
      const carts = await this.#readCartsFromFile()
      this.mensaje = "Carritos recuperados"
      return carts
    } catch (err) {
      this.mensaje = `Ocurrió un error en getCarts: ${err}`
    }
  }

  addCart = async()=>{
    try {
      CartManager.ultimo_id = CartManager.ultimo_id +1
      const cart_nuevo = {
        id: CartManager.ultimo_id,
        products:[]
      }
      this.cart.push(cart_nuevo)
      const cadenaArchivo = JSON.stringify(this.cart)
      await fs.promises.writeFile(this.ruta, cadenaArchivo)
      this.mensaje = "Carrito Agregado"
      console.log("Carrito Añadido")
      return cart_nuevo
    } catch (err) {
      this.mensaje = `AddProduct: ${err}`;
    }
    
  }

  getCartById = async(id)=>{
    try {
      const carts = await this.#readCartsFromFile()
      const filterId = carts.filter((cart)=> (cart.id === id)) 
      if (filterId.length === 0){
        this.mensaje = "Error, no hay ningun carrito con esa Id"
        return "Error, no hay ningun carrito con esa Id"
      }else{
        this.mensaje = "Carrito recuperado por ID"
        return filterId[0].products
      }
    } catch (err) {
      this.mensaje = `Ocurrió un error en getProductsById: ${err}`
    }
  }

  addCartProduct= async(idCart,idProd)=>{
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
  }
}

export default CartManager;