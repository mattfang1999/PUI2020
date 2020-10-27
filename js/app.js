//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItem = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const individualProductsDOM = document.querySelector('.single-product');



// cart
let cart = [];

//buttons
let buttonsDOM = [];

//----------------CLASSES--------------------

// responsible for getting the products from localstorage
class Products{

async getProducts(){
    try {
        let result = await fetch("products.json");
        //let's wait until we get the result
        let data = await result.json();
        //have products variable hold array
        let products = data.items;
        //destructure the products
        products = products.map(item => {
            //get the title and price from the fields property
            const {title, price} = item.fields;
            //get the id from the sys property
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            //return the new product 
            return {title, price, id, image}
        })
        return products 

    } catch (error) {
        console.log(error)
     }       
    }
}


class individualProductUI{
    displaySingleProduct(product){

    }
}


// responsible for display products, getting all the items from the products, or manipulating a product
class UI {
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            
                <article class="product" data-id='${product.id}'>
                        <div class='img-container'>
                         
                            <img src=${product.image} alt="product" class='product-img' data-id='${product.id}'>
                            
                            <button class='bag-btn' data-id='${product.id}'>
                                <i class='fas fa-shopping-cart'></i>
                                add to cart
                            </button> 
                            
                        </div>
                        <a href='/individual.html'> 
                            <h3>${product.title}</h3>
                            <h4>$${product.price}/roll</h4>
                        </a>
                    
                    
                </article>  
            

             `
        
        });

        //insert the products into the productsDOM
        productsDOM.innerHTML = result; 
    }




    

    //get bag buttons  
    getBagButtons(){
        //spread operator will turn nodelist into arraay
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;

        buttons.forEach(button => {
            let id = button.dataset.id;
            
            //check to see if item is in cart
            let inCart = cart.find(item => item.id === id);
            if (inCart){
                button.innerText = "Already in Cart";
                button.style.background = 'yellow';
                button.disabled = true;
            }
                button.addEventListener('click', (event) => {
                    event.target.innerText = "Already in Cart";
                    event.target.style.background = 'yellow ';
                    event.target.disabled = true;

                    //GET PRODUCT FROM PRODUCTS
                    //use spread operator 
                    //let cartItem = Storage.getProducts(id);

                    //1.Get the product from the products 
                    let cartItem = {...Storage.getProducts(id), amount:1};
                    
                    //2. add product item to cart array
                    cart = [...cart, cartItem];

                    //3. save the product in the cart in local storage
                    Storage.saveCart(cart);


                    //set cart values
                    this.setCartValues(cart);

                    //display cart items 
                    this.addCartItem(cartItem);

                    //show the cart
                    this.showCart();


                } )
            

        })


    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;

        })

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItem.innerText = itemsTotal
        
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `

        <img src=${item.image} alt="product">
        <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}/roll</h5>
          <span class='remove-item' data-id=${item.id}>remove from cart</span>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">1</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>



    </div>

        `
    cartContent.appendChild(div);

    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }



    setupAPP(){

        //cart will be a list of values we have in the cart, if there's anything
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
        this.cartLogic();

    }

    



    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));

    }

    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic(){
        //clear cart buttono
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        //cart functionality - event listeners in cart  
        cartContent.addEventListener("click", event => {
            if(event.target.classList.contains('remove-item'))
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
               
                this.removeItem(id);
            }
            else if (event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target; 
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;

            } else if(event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target; 
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    //update totals if greater than 0 
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else{
                    //remove from cart if lower than 0
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
                
                

            }
        })
    }

    //cart functionality
     

    // cartContent.addEventListener("click", event=>{

    // });
    

    clearCart(){
        //clear all the IDs
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id))
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);

        //Update the cart with proper value
        Storage.saveCart(cart);
        //reset the button
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
        button.style.background = '#FFFAEF';
        


    }

    getSingleButton(id){
        //will get the specific button that was used at that item
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

//local storage
class Storage{
    static saveProducts(products){

        //call the products and stringify it. 
        localStorage.setItem("products", JSON.stringify(products))

    }

    static getProducts(id){
        var products = JSON.parse(localStorage.getItem('products'));
        //if I click on a specific product, I want that product's info
        return products.find(product => product.id === id);
    }

    static saveCart(cart){
        
        localStorage.setItem('cart', JSON.stringify(cart))
        
    }

    static getCart(){
        //If cart is empty, then just return the empty cart.
        return localStorage.getItem('cart')?JSON.parse
        (localStorage.getItem('cart')):[]
    }

}


//-----------------END OF CLASSES----------------




//-----------------EVENT LISTENERS----------------

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // setup app
    ui.setupAPP();
    // ui.getAddCartButton();


    //get all products
    products.getProducts().then(products => {
        //first display, then save, and then connect the add cart buttons
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then( () => {
        ui.getBagButtons();
        
    });

    



    //click outside the cart to close overlay
    document.addEventListener("click", event => {
        console.log(event.target);
        if (event.target.classList.contains("transparentBcg") )
            ui.hideCart();
        
    })


    
});
