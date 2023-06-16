import fs from "fs"

class ProductManager{
  static ultimo_id = 0
  constructor(ruta){
    this.ruta = ruta
    this.products = []
  }

  #readProductsFromFile = async () => {
    const products = await fs.promises.readFile(this.ruta, "utf-8")
    return products === "" ? [] : JSON.parse(products)
  }
  
  showMensaje = ()=>{
    return this.mensaje
  }

  getProducts = async() => {
    try{
      const products = await this.#readProductsFromFile()
      this.mensaje = "Productos recuperados"
      return products
    }
    catch(err){
      this.mensaje = `Ocurrió un error en getProducts: ${err}`
    }
  }

  addProduct = async(obj)=>{
    try {
      const keys = Object.keys(obj)
      const obligatorios = ['title', 'description','code','price','status', 'stock','category']
      const sameCode = this.products.find((prod)=>prod.code === obj.code)
      
      if (obligatorios.every(val => keys.includes(val))) {
        if(!sameCode){
          ProductManager.ultimo_id = ProductManager.ultimo_id +1
          const producto_id = {
            id: ProductManager.ultimo_id
          }
          const producto_obj = obj
          const producto_nuevo = {...producto_id,...producto_obj}
          this.products.push(producto_nuevo)
          const cadenaArchivo = JSON.stringify(this.products)
          await fs.promises.writeFile(this.ruta, cadenaArchivo)
          this.mensaje = "Producto Agregado"
          console.log("Archivo actualizado")
          return producto_nuevo
        }else{
          this.mensaje = "Los productos no pueden incluir el mismo code"
          return "Los productos no pueden incluir el mismo code"
        }
      }else{
        this.mensaje = "Es obligatorio incluir todos los campos"
        return "Es obligatorio incluir todos los campos"
      }
      
    } catch (err) {
      this.mensaje = `AddProduct: ${err}`;
    }
  }

  getProductById = async(id)=>{
    try {
      const products = await this.#readProductsFromFile()
      const filterId = products.filter((prod)=> (prod.id == id)) 
      if (filterId.length === 0){
        this.mensaje = "Error, no hay ningun producto con esa Id"
        return "Error, no hay ningun producto con esa Id"
      }else{
        this.mensaje = "Producto recuperado por ID"
        return filterId
      }
    } catch (err) {
      this.mensaje = `Ocurrió un error en getProductsById: ${err}`
    }
  }

  updateProduct = async(id, campo)=>{
    try {
      const products = await this.#readProductsFromFile()
      const filterId = products.filter((prod)=> (prod.id == id))
      const key = Object.keys(campo)
      const value = Object.values(campo) 
      
      if (filterId.length === 0){
        this.mensaje = "Error, no hay ningun producto con esa Id"
        return "Error, no hay ningun producto con esa Id"
      }else{
        const filterOtherId = products.filter((prod)=> (prod.id !== id))
        filterId.map((elemento)=> (elemento[key]= value[0]))
    
        const cadenaProductos = [...filterOtherId, ...filterId]
        this.products = cadenaProductos
        const cadenaArchivo = JSON.stringify(cadenaProductos)
        await fs.promises.writeFile(this.ruta, cadenaArchivo)
        this.mensaje = "Producto editado"
        return filterId
      }
    } catch (error) {
      this.mensaje = `Ocurrió un error en updateProduct: ${error}`
      
    }
  }

  deleteProduct= async(id)=>{
    try {
      const products = await this.#readProductsFromFile()
      const filterId = products.filter((prod)=> (prod.id == id)) 
      if (filterId.length === 0){
        this.mensaje = "Error, no hay ningun producto con esa Id" 
        return "Error, no hay ningun producto con esa Id"
      }else{
        const filterIdDelete = products.filter((prod)=> (prod.id !== id))
        const cadenaArchivo = JSON.stringify(filterIdDelete)
        this.products= filterIdDelete
        await fs.promises.writeFile(this.ruta, cadenaArchivo)
        this.mensaje = "Producto eliminado" 
        return filterId
      }
    } catch (err) {
      this.mensaje = `Ocurrió un error en deleteProduct: ${err}`
    }
  }
}


export default ProductManager;
