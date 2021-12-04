$(document).ready(function(){
    
    $("#signupform").validate({
    rules:{
        email:{
            eamil:true,
            required:true
            
        },
      
        password:{
            required:true,
            minlength:6
        },
        mobile:{
            required:true,
            minlength:10
        },
        name:{
            required:true,
            minlength:3,
            maxlength:10
        }
       
        
    }
})
})
$(document).ready(function(){
    $("#login").validate({
        rules:{
            mobile:{
                required:true,
                maxlength:10
            },
            password:{
                required:true,
                maxlength:10
                
            }
           
        }
    })
})
$(document).ready(function(){
    $("#adminlogin").validate({
        rules:{
            email:{
                eamil:true,
                required:true
                
            },
          
            password:{
                required:true,
                minlength:6
            }
        }
       
       
    })
})
$(document).ready(function(){
    $("#addbrand").validate({
        rules:{
            Name:{
                required:true,
                maxlength:10

            },
            image1:{
                required:true,

            }
       
        }
    })
})
$(document).ready(function(){
    $("#addCategory").validate({
        rules:{
            Name:{
                required:true,
                maxlength:10
            },
            Sname:{
                required:true,
                maxlength:10
            }
        }
    })
})
$(document).ready(function(){
    $("#addproduct").validate({
       rules:{
        Name:{
            required:true,
            maxlength:10
        },
        Stock:{
            required:true,
            maxlength:10
        },
        Brand:{
            required:true
            
        },
        
        Scategory:{
            required:true
        },
        Size:{
            required:true 
        },
        Price:{
            required:true 
        },
        image1:{
            required:true 
        },
        image2:{
            required:true 
        },
        image3:{
            required:true
        },
        Discription:{
            required:true
        },
        category:{
            required:true
        }
       }
        
    })
})

$(document).ready(function(){
    $("#editProduct").validate({
       rules:{
        Name:{
            required:true,
            maxlength:10
        },
        Stock:{
            required:true
        },
        Discription:{
            required:true,
            maxlength:20
        },
        Brand:{
            required:true
        },
        Mcategory:{
            required:true
        },
        Scategory:{
            required:true
        },
        Size:{
            required:true
        },
        Colour:{
            required:true
        },
        Price:{
            required:true
        }
        
       
       
       },
       submitHandler: function submitForm(form) {
        console.log(form)
        swal.fire({ 
            title: "Are you sure?",
            text: "This form will be submitted",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((isOkay) => {
            if (isOkay) {
                console.log("isokay")
                form.submit();
            }
        });
        return false;
    }
       
    })

    
})
function fileValidation1() {
    const imagebox = document.getElementById('image-box')
    const crop_btn = document.getElementById('crop-btn')
    var fileInput = document.getElementById('file1');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg)$/i;
    if (!allowedExtensions.exec(filePath)) {
        alert('Please upload file having extensions .jpeg only.');
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
        const image = document.getElementById('image')
        document.getElementById('image-box').style.display = 'block'
        document.getElementById('crop-btn').style.display = 'block'
        document.getElementById('confirm-btn').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('file1');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgview1').src = url
                document.getElementById('image-box').style.display = 'none'
                document.getElementById('crop-btn').style.display = 'none'
                document.getElementById('confirm-btn').style.display = 'block'
            });
        });
    }
}


    
function fileValidation2() {
    const imagebox = document.getElementById('Image1')
    const crop_btn = document.getElementById('crop1')
    var fileInput = document.getElementById('F1');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg)$/i;
    if (!allowedExtensions.exec(filePath)) {
        alert('Please upload file having extensions .jpeg only.');
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="imageP1" style="width:100%">`
        const image = document.getElementById('imageP1')
        document.getElementById('Image1').style.display = 'block'
        document.getElementById('crop1').style.display = 'block'
        document.getElementById('Confirm1').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('F1');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgviewP1').src = url
                document.getElementById('Image1').style.display = 'none'
                document.getElementById('crop1').style.display = 'none'
                document.getElementById('Confirm1').style.display = 'block'
            });
        });
    }
}

    
function fileValidation3() {
    const imagebox = document.getElementById('Image2')
    const crop_btn = document.getElementById('crop2')
    var fileInput = document.getElementById('F2');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg)$/i;
    if (!allowedExtensions.exec(filePath)) {
        alert('Please upload file having extensions .jpeg only.');
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="imageP2" style="width:100%">`
        const image = document.getElementById('imageP2')
        document.getElementById('Image2').style.display = 'block'
        document.getElementById('crop2').style.display = 'block'
        document.getElementById('Confirm1').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('F2');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgviewP2').src = url
                document.getElementById('Image2').style.display = 'none'
                document.getElementById('crop2').style.display = 'none'
                document.getElementById('Confirm1').style.display = 'block'
            });
        });
    }
}


    
function fileValidation4() {
    const imagebox = document.getElementById('Image3')
    const crop_btn = document.getElementById('crop3')
    var fileInput = document.getElementById('F3');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg)$/i;
    if (!allowedExtensions.exec(filePath)) {
        alert('Please upload file having extensions .jpeg only.');
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="imageP3" style="width:100%">`
        const image = document.getElementById('imageP3')
        document.getElementById('Image3').style.display = 'block'
        document.getElementById('crop3').style.display = 'block'
        document.getElementById('Confirm1').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('F3');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgviewP3').src = url
                document.getElementById('Image3').style.display = 'none'
                document.getElementById('crop3').style.display = 'none'
                document.getElementById('Confirm1').style.display = 'block'
            });
        });
    }
}

function fileValidationBrand() {
    const imagebox = document.getElementById('image-box')
    const crop_btn = document.getElementById('crop-btn')
    var fileInput = document.getElementById('file1');

    var filePath = fileInput.value;
    var allowedExtensions = /(\.jpg)$/i;
    if (!allowedExtensions.exec(filePath)) {
        alert('Please upload file having extensions .jpeg only.');
        fileInput.value = '';
        return false;
    } else {
        //Image preview
        const img_data = fileInput.files[0]
        const url = URL.createObjectURL(img_data)
        imagebox.innerHTML = `<img src="${url}" id="image" style="width:100%">`
        const image = document.getElementById('image')
        document.getElementById('image-box').style.display = 'block'
        document.getElementById('crop-btn').style.display = 'block'
        document.getElementById('confirm-btn').style.display = 'none'

        const cropper = new Cropper(image, {
            autoCropArea: 1,
            viewMode: 1,
            scalable: false,
            zoomable: false,
            movable: false,
            aspectRatio: 16 / 19,
            //  preview: '.preview',
            minCropBoxWidth: 180,
            minCropBoxHeight: 240,
        })
        crop_btn.addEventListener('click', () => {
            cropper.getCroppedCanvas().toBlob((blob) => {
                let fileInputElement = document.getElementById('file1');
                let file = new File([blob], img_data.name, { type: "image/*", lastModified: new Date().getTime() });
                let container = new DataTransfer();

                container.items.add(file);
                const img = container.files[0]
                var url = URL.createObjectURL(img)
                fileInputElement.files = container.files;
                document.getElementById('imgview1').src = url
                document.getElementById('image-box').style.display = 'none'
                document.getElementById('crop-btn').style.display = 'none'
                document.getElementById('confirm-btn').style.display = 'block'
            });
        });
    }
}
