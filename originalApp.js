//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//cart
let cart = [];
let buttonsDOM = [];

// function printCart(){
//   console.log(cart);
// }
// function clearCartVar(){
//   cart=[];
//   console.log(cart);
// }

//clases
class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const {
          title,
          price
        } = item.fields;
        const {
          id
        } = item.sys;
        const image = item.fields.image.fields.file.url;
        return {
          title,
          price,
          id,
          image
        };
      })
      return products;
    } catch (e) {
      console.log(e);
    };
  };

}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
      <!--single product-->
      <article class="product">
        <div class="img-container">
          <img src=${product.image} alt="product" class="product-img">
          <button class="bag-btn" data-id=${product.id}>
            <i class= "fas fa-shopping-cart"></i>
            add to cart
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      <!--end of single product-->
      `;
    });
    productsDOM.innerHTML = result;
  }
  setCartButtons() {
    //Crear array con botones
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;

    //Agregar funcionalidad para cada boton
    buttons.forEach(button => {

      //Tomar del dataset de este boton su Id
      let id = button.dataset.id;

      //booleano que indique si hay un item en cart con el id de este producto.
      let inCart = cart.find(item => item.id === id);

      //Si el id esta en el cart, desabilitamos el botton
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      //Si no està en cart, le agregamos funcionalidad para poder agregarlo
      button.addEventListener("click", event => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get del producto almacenado localmente
        let cartItem = {
          ...Storage.getProduct(id),
          amount: 1
        };
        //agregar el cartItem a el carrito vacio
        cart = [...cart, cartItem];
        console.log(cart);
        //guardar el carrito actualizado en localStorage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show cart
        this.showCart();
      });
    });
  };
  //Calcular la cantidad de items y mostrarlo en el icono de cart
  //Calcular el valor total de la compra y mostrarlo en el cart
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    <img src= ${item.image} alt="product">
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `;
    //terminamos agregando el div creado dentro de cartContent
    cartContent.appendChild(div);
  };

  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  };
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  };

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  };

  populateCart(cart) {
    cart.forEach(cartItem => this.addCartItem(cartItem));
  };

  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });

    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        //removemos del DOM de cart Content el padre del padre de el boton (Osea todo el item)
        cartContent.removeChild(removeItem.parentElement.parentElement);
        //removemos el item del cart en local Storage
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if(tempItem.amount>0){
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElement.innerText = tempItem.amount;
        }
        else{
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    //filtrar el cart, regresando unicamente los items que no tengan este id.
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(prods) {
    localStorage.setItem("products", JSON.stringify(prods));
  };
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  };
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //set up aplication
  ui.setupAPP();

  //get All products
  products.getProducts()
    .then(prods => {
      ui.displayProducts(prods);
      Storage.saveProducts(prods);
    })
    .then(() => {
      ui.setCartButtons();
      ui.cartLogic();
    });
});
