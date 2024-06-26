const productoCtrl = {};

const Producto = require('../models/Producto');
const User = require('../models/Usuario');

productoCtrl.renderProductoForm = (req, res) => {
    res.render('productos/new-producto');
};

productoCtrl.createNewProducto = async (req, res) => {
    const {nombre, marca, categoria, elementos, imagenes, imagenPrincipal, imagenSecundaria, descripcion, trazas} = req.body;
    const newProducto = new Producto({nombre, marca, categoria, elementos, imagenes, imagenPrincipal, descripcion, trazas});
    const filearray=req.files;
    const arrayFN=[];
    filearray.forEach(elem=>arrayFN.push(`/images/${elem.filename}`));
    newProducto.imagenPrincipal = arrayFN[0];
    newProducto.imagenSecundaria = arrayFN[1];
    newProducto.imagenes = arrayFN;
    await newProducto.save();
    req.flash('success_msg', 'Producto Agregado Correctamente');
    res.redirect('/productos');
};

productoCtrl.renderProductos = async (req, res) => {
    /*const productos = await Producto.find().lean(); 
    res.render('productos/all-productos', { productos, user: req.user  });*/
    try {
        const productos = await Producto.find().lean();
        const isAdmin = req.user && req.user.admin; // Verifica si el usuario es un administrador
        res.render('productos/all-productos', { productos, isAdmin });
      } catch (error) {
        console.error(error);   
      }
};

productoCtrl.renderProdCategory = async (req, res) => {
    await Producto.find({ categoria: { $all: [req.params.id]} }).lean()
        .then(productos => res.render('productos/all-productos', { productos }))
        .catch(e => console.log("Ha ocurrido un error: ", e));
};

productoCtrl.renderSearchProducto = async (req, res) => {
    const isAdmin = req.user && req.user.admin;
    const busqueda = req.body.item;
    const array = busqueda.split(" ");
    const regex = new RegExp(array.join('|'));
    console.log("regex", regex);

    try {
        const searchproductoArray = await Producto.find({ nombre: { '$regex': regex, $options: 'i' } }).lean();

        // Tomar el primer elemento del arreglo (si existe)
        const producto = searchproductoArray.length > 0 ? searchproductoArray[0] : null;

        console.log("Contenido de searchproducto:", producto);
        
        res.render('productos/ver-producto', { producto, isAdmin });
      
    } catch (e) {
        console.log("Ha ocurrido un error: ", e);
        res.render('productos/search-producto', { searchproducto: null, isAdmin });
    }
};


productoCtrl.renderProducto = async (req, res) => {    
    const producto = await Producto.findById(req.params.id).lean();
    const aux = await Producto.findById(req.params.id).lean()
    const aux_categoria = await Producto.findById(req.params.id).select("categoria").lean()
    const isAdmin = req.user && req.user.admin; // Verifica si el usuario es un administrador
    const elementos = aux.elementos

    let p = await Producto.find({ elementos: { $not: { $all : elementos[0]}} }).lean()

    const productoSus = []
    let flag = true
    elementos.shift()

    let usuario;
    if (req.user) {
        usuario = await User.findById(req.user._id).lean();
    }

    p.forEach((item) => {
        flag = true
        elementos.forEach((word) => {
            if(item.elementos.includes(word))
                flag = false
        })
        if (flag) {
            let flag1 = true
            aux_categoria.categoria.forEach((category) => {
                if(item.categoria.includes(category) && flag1) {
                    // Verifica si el producto es seguro para el usuario.
                    if (usuario && !usuario.elements.some(element => item.trazas.includes(element))) {
                        productoSus.push(item)
                    }
                    flag1 = false
                }
            })
        }
    })

    res.render('productos/ver-producto', { producto, productoSus, isAdmin });
};




productoCtrl.renderEditForm = async (req, res) => {
    const producto = await Producto.findById(req.params.id).lean();
    res.render('productos/edit-producto', { producto });
};

productoCtrl.updateProducto = async (req, res) => {
    const { nombre, marca, categoria, elementos, imagenes} = req.body;
    await Producto.findByIdAndUpdate(req.params.id, {nombre, marca, categoria, elementos, imagenes});
    req.flash('success_msg', 'Producto Actualizado Correctamente')
    res.redirect('/productos');
};

productoCtrl.deleteProducto = async (req, res) => {
    await Producto.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Producto Eliminado Correctamente')
    res.redirect('/productos');
};

module.exports = productoCtrl;