let ingredientCounter = 0;
const intolerances = [];
const diets = [];
let nutrition = false;

function addToList() {
    const ingredientList = document.getElementById('ingredientList');
    var ingredient = document.getElementById('inputIngredient').value;
    const symbolRegexCheck = /[^\w\s]/gi;
    const numberRegexCheck =/[0-9]/gi;

    if (ingredient != "" && numberRegexCheck.test(ingredient) == false && symbolRegexCheck.test(ingredient) == false) {
        const addIng = ingredient.replace(/\s/g, "");
        const partAdd = document.createElement('li');
        const addButton = document.createElement('button');
        ingredientCounter++;

        partAdd.textContent = addIng;
        partAdd.id = "ingredientNo" + ingredientCounter;
        partAdd.value = ingredientCounter;

        addButton.textContent = "Remove ingredient";
        addButton.className = "removeIngredient";
        addButton.onclick = () => removeFromList(partAdd.value);

        partAdd.appendChild(addButton);
        ingredientList.appendChild(partAdd);
        ingredientList.classList.remove("hidden");
        document.getElementById('inputIngredient').value = "";

    } else {
        window.alert("ERROR! INGREDIENT ENTERED IS NOT VALID");
        document.getElementById('inputIngredient').value = "";
    }
}

function removeFromList(count) {
    const ingredientList = document.getElementById('ingredientList');
    let removeIng = "";
    let counter = 1;
    const allIngredients = Array.from(document.querySelectorAll("[id*='ingredientNo']"));

    for (let i = 0; i < allIngredients.length; i++) {

        let tempIngredient = allIngredients[i];
        if (tempIngredient.value === count) {
            removeIng = tempIngredient;
            break;
        }
    }
    ingredientList.removeChild(removeIng);

    if (ingredientList.children.length === 0) {
        ingredientList.classList.add("hidden");
        counter === 0;
    } else {

        allIngredients.forEach((individualIng) => {
            individualIng.id = 'ingredientNo' + counter;
            individualIng.value = counter;
            counter++;
        });
    }
    ingredientCounter = counter;
}

function hideMenu(hiddenElement){
    var popUp = document.getElementById(hiddenElement);
    popUp.classList.toggle('visible');
}

function generateRecipe() {
    const temp = document.querySelectorAll('[type="checkbox"]');
    const intoleranceArray = [];
    const dietArray = [];
    const ingredients = [];
    let apiIng, apiDiet, apiInt;
    let nutrition = false;
    const apiKey = document.getElementById('apiKey').value;

    if (apiKey !== "") {
        temp.forEach((current) => {

            if((current.checked) === true) {
    
                if((current.id).includes('intoleranceCheck')) {
                    intoleranceArray.push(current.value);
    
                } else if ((current.id).includes('dietCheck')) {
                    dietArray.push(current.value);
    
                } else {
                    if ((current.value) === "on") {
                        nutrition = true;
                    } else {
                        nutrition = false;
                    }
                }
            }
        })
    
        localStorage.setItem("nutritionalInfo", JSON.stringify(nutrition));
        const ingredientsCount = document.querySelectorAll("[id*='ingredientNo']");
        const ingredientArray = Array.from(ingredientsCount);
    
        ingredientArray.forEach((currentIng) => {
    
            const tempIng = (currentIng.textContent).replace(/remove|ingredient/gi, '').trim();
            ingredients.push(tempIng);
        })
    
        if (ingredients.length !== 0) {
            const ingredientList = ingredients.toString();
            apiIng = "&includeIngredients=" + ingredientList;
        } else {
            apiIng = "";
        }
        
        if (intoleranceArray.length !== 0) {
            const intolerances = intoleranceArray.toString();
            apiInt = "&intolerances=" + intolerances;
        } else {
            apiInt = "";
        }
    
        if (dietArray.length !== 0) {
            const diets = dietArray.toString();
            apiDiet = "&diet=" + diets;
        } else {
            apiDiet = "";
        }
    
        const apiReq = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}${apiIng}${apiInt}${apiDiet}&addRecipeNutrition=${nutrition}&instructionsRequired=true&addRecipeInstructions=true&fillIngredients=true`;
        localStorage.setItem("apiKey", JSON.stringify(apiReq));
        window.location.href='generatedRecipe.html';
    } else {
        window.alert("ERROR! ENTER API KEY!");
    }
}

async function generateCards() {
    const apiRequest = JSON.parse(localStorage.getItem("apiKey"));
    console.log(apiRequest);
    let recipes = [];
    try {
        const generateResponse = await fetch(apiRequest);
        const jsonData = await generateResponse.json();
        recipes = jsonData.results;
    } catch (error) {
        window.alert(error);
    }
    const nutritionInfo = JSON.parse(localStorage.getItem("nutritionalInfo"));
    localStorage.removeItem("apiKey");
    localStorage.removeItem("nutritionalInfo");
    let recipeInstructions = [];
    const carousel = document.getElementsByClassName("glide__slides")[0];
    recipes.forEach((individualRecipe, counter) => {
        
        const addRecipe = document.createElement('li');
        const recipeContainer = document.createElement('div');
        const instAndIng = document.createElement('div');
        const titleAndImg = document.createElement('div');

        titleAndImg.className = 'recTitleAndImg';
        recipeContainer.appendChild(titleAndImg);

        recipeContainer.className = "recContainer";
        addRecipe.appendChild(recipeContainer);
        
        instAndIng.className = "instAndIng";
        recipeContainer.appendChild(instAndIng);

        createElements('div', ['id'], ['recTitle'], individualRecipe.title, titleAndImg);

        if(individualRecipe.image) {
            createElements('img', ['src', 'id'], [individualRecipe.image, 'recImage'], "", titleAndImg);
        }

        if ((individualRecipe.analyzedInstructions).length > 0) {
            const instructions = individualRecipe.analyzedInstructions[0].steps;
            instructions.forEach((instruction) => {
                const stepNo = instruction.number;
                const step = instruction.step;
                recipeInstructions.push("Step " + stepNo + ": " + step + "\n");
            });
            const combinedInstructions = recipeInstructions.join("");
            createElements('p', ['id'], ['recInstructions'], combinedInstructions, instAndIng);
        }

        const ingredients = [];
        const misIngre = [];
        const usedIngredients = individualRecipe.usedIngredients;
        usedIngredients.forEach((usedIng) => {
            ingredients.push(usedIng.original + "\n");
        })
        const usedI = ingredients.join("");

        const misIngredients = individualRecipe.missedIngredients;
        misIngredients.forEach((misIng) => {
            misIngre.push(misIng.original + "\n");
        })
        const missI = misIngre.join("");
        const sendIngredients = "Used ingredients: \n" + usedI + " \n Missing Ingredients: \n" + missI;
        createElements('p', ['id'], ['recIngredients'], sendIngredients, instAndIng);

        if (nutritionInfo === true) {
            const nutritionIn = document.createElement("div");
            const allNutrition = [];

            (individualRecipe.nutrition.nutrients).forEach((nutrient) => {
                const nutritionName = nutrient.name;
                const nutritionAmount = nutrient.amount;
                const nutritionUnit = nutrient.unit.split();
                allNutrition.push(nutritionName + ": " + nutritionAmount + nutritionUnit + ' \n');
            })

            const nutrionalInformation = allNutrition.join("");
            nutritionIn.id = "nutritionIn";
            nutritionIn.textContent = "Nutritional Info: " + nutrionalInformation;
            recipeContainer.appendChild(nutritionIn);
        }

        addRecipe.id = "recipe__" + counter;
        recipeInstructions = [];
        carousel.appendChild(addRecipe);
    })

    /*<-- GLIDE INITILIZATION --> */

        new Glide('.glide', {
            type: 'slider',
            perView: 1,
            gap: 30,
        }).mount();   
}
    /*<-- END OF GLIDE INITILIZATION --> */

function createElements(elementType, attrib, attriContent, elementText, elementLocation) {
    const creatEl = document.createElement(elementType);
    for (let i = 0; i < attrib.length; i++) {
            creatEl.setAttribute(attrib[i], attriContent[i]);
    }
    if (elementText != "") {
        creatEl.textContent = elementText;
    }
    elementLocation.appendChild(creatEl);
}