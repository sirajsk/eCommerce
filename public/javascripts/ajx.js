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
  function addTowish(proId) {
    // console.log(proId);
    $.ajax({
      // console.log(pro);
      url: "/add-to-Wish/" + proId,
      method: 'get',
      success: (response) => {
        if (response.status){
            // let count=$('#wish-count').html()
            // count=parseInt(count)+1
            // $('#wish-count').html(count)
            console.log('hhhhh');
        }
       
      }
    })
  }