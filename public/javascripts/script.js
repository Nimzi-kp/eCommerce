const { response } = require("express")

function addToCart(proId){
    $.ajax({ 
        url: '/is-logged-in', 
        method: 'get', 
        success: (response) => { 
            if (response.loggedIn){
                $.ajax({
                    url:'/add-to-cart/'+proId,
                    method:'get',
                    success:(response)=>{
                        if(response.status){
                            let count = $('#cart-count').html()
                            count = parseInt(count)+1
                            $('#cart-count').html(count)
                        }
                    }
                })
            }else { 
                window.location.href = '/login'; 
            } 
        } 
    }); 
}

function changeQuantity(cartId, proId, userId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML);
    count = parseInt(count);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user:userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.remove) {
                removeProduct(cartId,proId)
            }else{
                document.getElementById(proId).innerHTML = quantity + count;
                document.getElementById('cartAmount').innerHTML = response.total;
            }
        }
    });
}

function removeProduct(cartId, proId) { 
    if (confirm('your going to remove the product from cart!')) { 
        remove(cartId, proId); 
    }
}

function remove(cartId, proId) {
    $.ajax({
        url: '/remove-from-cart',
        data: {
            cart: cartId,
            product: proId
        },
        method: 'post',
        success:async (response) => {
            if (response.success) {
                location.reload();
            }
        }
    })
}