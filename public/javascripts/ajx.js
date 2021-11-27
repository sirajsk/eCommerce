function addTocart(proId) {
    // console.log(proId);
    $.ajax({
      // console.log(pro);
      url: "/add-to-cart/" + proId,
      method: 'get',
      success: (response) => {
        if (response.status){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
            $('#cart-count').html(count)
        }
       
      }
    })
  }