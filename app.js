const productSectionDOM = document.querySelector('.products-center');


class Product {
  static async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      //Maping the products.json to get the necesary format
      let products = data.items.map(item => {
        const productId = item.sys;
        const productTitle = item.fields.title;
        const productPrice = item.fields.price;
        const productImgUrl = item.fields.image.fields.file.url;
        return {
          productId,
          productTitle,
          productPrice,
          productImgUrl
        };
      });
      return products;
    } catch (e) {
      return e;
    };
  };

}

class UI {
  static displayStoredProducts() {
    //we create a template literal with an article per stored productSection
    let articles = '';
    Storage.getStoredProducts().forEach(prod => {
      //add a single article to articles
      articles += `
      <!--single product-->
      <article class="product">
        <div class="img-container">
          <img src=${prod.productImgUrl} alt="product" class="product-img">
          <button class="bag-btn" data-id=${prod.ProductId}>
            <i class= "fas fa-shopping-cart"></i>
            add to cart
          </button>
        </div>
        <h3>${prod.productTitle}</h3>
        <h4>$${prod.productPrice}</h4>
      </article>
      <!--end of single product-->
      `;
    });
    productSectionDOM.innerHTML = articles;
  }
  static setAddToBagBtns() {
    const addToBagBtns = [...document.querySelectorAll('.bag-btn')];
    addToBagBtns.forEach(btn => {
      addEventListener('click', event => {
        const id = event.target.dataset.id;
        //cart in storage is updated.
        Storage.addProductToCart(id);
        //UI adds item to cart element, displays cart , and disables button
      })
    });
  }
}


class Storage {
  static getStoredProducts() {
    //get a local store 'products' and parse it before return
    return JSON.parse(localStorage.getItem('products'));
  };
  static addProductToCart(productId){
    var previousCart= localStorage.getItem('cart');
    if (previousCart){
      localStorage.setItem= [...previousCart]+
    }
    else{
      //si no existe el carrito, lo creamos y luego agregamos el producto

    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  //get products from json
  const product = new Product();
  Product.getProducts()
    .then(resultProds => {
      //save products in local Storage
      localStorage.setItem('products', JSON.stringify(resultProds));
      //generate all the articles and append as children to productSection
      UI.displayStoredProducts()
    })
    .then(
      //capture products displayed and functionality to the buttons
      UI.setAddToBagBtns()
    )
});
