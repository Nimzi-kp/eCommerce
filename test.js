{/* <section>
    <div class="container">
        <table class="table mt-5">
            <thead>
                <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Title</th>
                    <th scope="col">Price</th>
                    <th scope="col">Quantity</th>
                    <th scope="col"> </th>
                </tr>
            </thead>
            <tbody>
                {{#each products}}
                <tr>
                    <td><img style="width: 70px;height:70px" src='/product-img/{{this.product._id}}.jpg' alt="Image not found"></td>
                    <td>{{this.product.title}}</td>
                    <td>Rs.{{this.product.price}}</td>
                    <td >
                        <button class="cart-item-count me-3" onclick="changeQuantity('{{this._id}}','{{this.product._id}}','{{../user._id}}',-1)">-</button>
                        <span id="{{this.product._id}}">{{this.quantity}}</span>
                        <button class="cart-item-count ms-3" onclick="changeQuantity('{{this._id}}','{{this.product._id}}','{{../user._id}}',1)">+</button>
                    </td>
                    <td><a href="" class="btn btn-danger" onclick="removeProduct('{{this._id}}', '{{this.product._id}}')">Remove</a></td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        <hr>
        <div class="float-end pe-5">
            <h5 class="float-start me-5">Total: Rs. <span id="cartAmount">{{totalAmount}}</span></h5>
            <a href="/place-order" class="btn btn-success mt-3" style="width: 100%;"><b>Place Order</b></a>
        </div>
    </div>
</section>  */}