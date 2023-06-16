import mongoose from 'mongoose';
import productModel from '../models/products.model.js';

class Products {
    static ultimo_id = 0
    constructor() {
        this.status = 0;
        this.statusMsg = "inicializado";
    }
  
    static requiredFields = ['title', 'description','code','price','status', 'stock','category'];
  
    static #verifyRequiredFields = (obj) => {
        return Products.requiredFields.every(field => Object.prototype.hasOwnProperty.call(obj, field) && obj[field] !== null);
    }
  
    static #objEmpty (obj) {
        return Object.keys(obj).length === 0;
    }
  
    checkStatus = () => {
        return this.status;
    }
  
    showStatusMsg = () => {
        return this.statusMsg;
    }

    addProduct = async (product) => {
        try {
            const products = await productModel.find();
            const prodIds = []
            products.forEach((prod)=>{
             prodIds.push(prod.id)
            })
            const prodLastId= Math.max(...prodIds)
            Products.ultimo_id = prodLastId +1
            const sameCode = products.some((prod)=>prod.code === product.code)
            console.log(sameCode)
                if (!Products.#objEmpty(product) && Products.#verifyRequiredFields(product)) {
                    const productNew = {
                    id: Products.ultimo_id,
                    ...product
                    }
                    if(sameCode){
                        this.status =1;
                        this.statusMsg = "Code repetido";
                    }else{
                        const process = await productModel.create(productNew)
                        this.status = 1;
                        this.statusMsg = "Producto registrado en bbdd";
                    }
                } else {
                    this.status = -1;
                    this.statusMsg = `Faltan campos obligatorios (${Products.requiredFields.join(', ')})`;
                }
            } catch (err) {
                this.status = -1;
                this.statusMsg = `AddProduct: ${err}`;
            }
    }
  
    getProducts = async () => {
        try {
            const products = await productModel.find().lean()
            this.status = 1;
            this.statusMsg = 'Productos recuperados';
            return products
        } catch (err) {
            this.status = -1;
            this.statusMsg = `getProducts: ${err}`;
        }
    }
  
    getProductById = async (id) => {
        try {
            const process = await productModel.find({id:id});
            this.status = 1;
            this.statusMsg = 'Productos recuperados';
            return process
        } catch (err) {
            this.status = -1;
            this.statusMsg = `getProductById: ${err}`;
        }
}


  updateProduct = async (id, data) => {
      try {
          if (data === undefined || Object.keys(data).length === 0) {
              this.status = -1;
              this.statusMsg = "Se requiere body con data";
          } else {
              const process = await productModel.updateOne({ id: id }, data);
              this.status = 1;
              this.statusMsg = process.modifiedCount === 0 ? this.statusMsg = "El ID no existe o no hay cambios por realizar": this.statusMsg = "Producto actualizado";
          }
      } catch (err) {
          this.status = -1;
          this.statusMsg = `updateProduct: ${err}`;
      }
  }

  deleteProduct = async (id) => {
    try {
        const process = await productModel.deleteOne({ id:id });
        this.status = 1;
        process.deletedCount === 0 ? this.statusMsg = "El ID no existe": this.statusMsg = "Producto borrado";
    } catch (err) {
        this.status = -1;
        this.statusMsg = `deleteProduct: ${err}`;
    }
  }
}

export default Products;