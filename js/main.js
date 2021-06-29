//đối tượng 'validator'
function Validator (options) {

    function getParent(e, selector){
        while(e.parentElement){
            if(e.parentElement.matches(selector)){
                return e.parentElement;
            }
            e = e.parentElement;
        }
    }
    var selectorRules = {};
    //hàm thực hiện validate
    function validate(inputElement, rule){

        //var errorElement = getParent(inputElement, '.form-group')
        var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorSelector)
        var errorMessage;

        //lấy ra các rule của selector
        var rules = selectorRules[rule.selector]
        
        //lặp qua từng rule và kiểm tra
        //nếu có lỗi thì dừng (break) kiểm tra
        for(var i = 0; i < rules.length; i++){
            switch (inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;
                default:
                    errorMessage =rules[i](inputElement.value)
            }
             if(errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerHTML = errorMessage
            getParent(inputElement, options.formGroup).classList.add('invalid')
        }else{
            errorElement.innerHTML = ""
            getParent(inputElement, options.formGroup).classList.remove('invalid')
        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);
    if(formElement){
        formElement.onsubmit = function(element){
            element.preventDefault();

            //
            var isFormValid = true;

            //lặp qa từng rule và validate
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule)
                if(!isValid){
                    isFormValid = false;
                }
            })

            console.log(formValues);

            if(isFormValid){
                //trường hợp submit vs javascript
                if(typeof options.onSubmit === 'function'){
                    
                    var enableInput = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInput).reduce(function(values,input) {
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name]= [];
                                    return values;
                                }   
                                if(!Array.isArray( values[input.name])){
                                    values[input.name]= [];
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        
                        return values;
                    }, {})
        
                    options.onSubmit(formValues)
                }
                //trường hợp submit với hành vi mặc định
                else{
                    formElement.submit();
                }
            }
        }

        //lặp qua mỗi rule và xử lí(lắng nghe sự kiện blur, input ...)
        options.rules.forEach((rule) => {
            //lưu rules lại cho mỗi input
             if(Array.isArray(selectorRules[rule.selector]))
             {
                selectorRules[rule.selector].push(rule.test)
             }else{
                selectorRules[rule.selector] = [rule.test]
             }

            //lấy element của form cần validate
            var inputElements = formElement.querySelectorAll(rule.selector)
           
            Array.from(inputElements).forEach(function(inputElement){
                //xử lý trường hợp blur ra input
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                };

                //xử lý trường hợp mỗi khi người dùng nhập input
                inputElement.oninput = () => {
                    var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorSelector)
                    errorElement.innerHTML = ""
                    getParent(inputElement, options.formGroup).classList.remove('invalid')
                }
            })
        });
        // console.log(selectorRules)
    }

    // console.log(options.rules);
}

//định nghĩa rules
//nguyên tắc của các rules:
//khi có lỗi => trả ra message lỗi
//khi không có lỗi => không trả ra gì cả (undefined) 
Validator.isRequired = (selector, message) => {
    return {
        selector: selector,
        test: function (value){
            if(typeof value === 'string'){
                return value.trim() ? undefined : message || "Vui lòng nhập trường này";
            }
            return value ? undefined : message || "Vui lòng nhập trường này";
        }
    };
}

Validator.isEmail = function (selector, message){
    return {
            selector: selector,
            test: function (value){
                var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                return regex.test(value) ? undefined : message || "Trường này phải là Email";
            }
    };
}

Validator.minLength = function (selector, min, message){
    return {
            selector: selector,
            test: function (value){
                return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
    };
}

Validator.isConfirm = function (selector, getValue, message){
    return {
        selector: selector,
        test: function (value){
            return value === getValue() ? undefined : message || "Giá trị nhập vào không chính xác";
        }
    }
}