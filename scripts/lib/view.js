import * as Index from "../index.js";

// Selecteurs
const blockFilters = document.querySelectorAll('.block-filters');
const filterCtn = document.querySelectorAll('.filter-ctn');
const tagCtn = document.querySelectorAll('.tag-ctn');

// masquer les listes tags filtres au lancement
filterCtn.forEach(element => {
    element.style.display = 'none';
});
tagCtn.forEach(element => {
    element.style.display = 'none';
});

export function displayError(searchValue, usedTags) {
    const errorDiv = document.querySelector('#error-container');
    if (!errorDiv) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<p id="error-container">Aucune recette ne correspond à la recherche "${searchValue} " ${usedTags} vous pouvez chercher «
        tarte aux pommes », « poisson », etc...</p>`;
        document.body.appendChild(errorDiv);
    } else {
        errorDiv.innerHTML = `<p>Aucune recette ne correspond à la recherche "${searchValue} " ${usedTags} vous pouvez chercher «
        tarte aux pommes », « poisson », etc...</p>`;
        document.body.appendChild(errorDiv);
    }
}

export function clearDisplayError() {
    const errorDiv = document.querySelector('#error-container');
    if (errorDiv) {
        errorDiv.innerHTML = '';
    }
}

function sortTags(tags) {
    return tags.sort(Intl.Collator().compare);
}

export function getSelectedTags() {
    const selectedTags = Array.from(document.querySelectorAll('.selected-tag')).map(tag => tag.textContent);
    return selectedTags;
}

// Factory de recette
export function recipeFactory(data) {
    const {
        id, image, name, time, description, ingredients
    } = data;
    const picture = `assets/images/${image}`;

    // fonction pour créer la structure HTML de la card (recette)
    // ** ToDo => A optimiser pour que l'execution soit plus rapide  **
    function makeRecipeCardDOM() {
        const article = document.createElement('article');
        article.innerHTML = `                    <a href="#" data-id="${id}">
        <div class="ctn-image">
            <img src="${picture}" alt="Image de la recette ${name}">
            <div class="tmp">${time}</div>
        </div>
        <div class="recipe-infos">
            <div class="ctn-txt">
                <div class="align">
                    <div class="all-size">
                        <h3 class="card-title">${name}</h3>
                    </div>
                    <h4>RECETTE</h4>
                    <div class="all-size">
                        <p class="description">${description}</p>
                    </div>
                    <h4>INGREDIENTS</h4>
                    <div class="ctn-ingredients">
                    ${makeIngredientsHTML(ingredients)}
                </div>

                </div>
            </div>
        </div>
    </a>`;
        return (article);
    }

    // fonction pour ajouter les ingrédients à la card
    function makeIngredientsHTML(ingredients) {
        let ingredientsHTML = '';

        ingredients.forEach(ingredient => {
            const { ingredient: name, quantity, unit } = ingredient;
            const formattedName = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();


            ingredientsHTML += `
          <div class="ingredients">
            <p>${formattedName}</p>
            <p>${quantity ? quantity : ''} ${unit ? unit : ''}</p>
          </div>
        `;
        });
        return ingredientsHTML;
    }
    return { makeRecipeCardDOM: makeRecipeCardDOM };
}

//

// Formater (normalizer) les données des recettes
function formatCardRecipe(recipeData) {
    return {
        id: recipeData.id,
        image: recipeData.image,
        name: recipeData.name,
        time: recipeData.time,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        appliance: recipeData.appliance,
        ustensils: recipeData.ustensils
    };
}

// Afficher les datas recipes dans card-container
export function displayRecipes(recipesParam) {
    const recipesSection = document.querySelector('#card-container');

    // pour chaques recette, afficher la recette correspondante dans le DOM
    recipesParam.forEach(itemData => {
        const item = formatCardRecipe(itemData);
        const recipeModel = recipeFactory(item);
        const recipeCardDOM = recipeModel.makeRecipeCardDOM();
        recipesSection.appendChild(recipeCardDOM);
    });
}

// Afficher les ingredients dans la selectBox
export function displayIngredients(recipesParam) {
    const ingredientSection = document.querySelector('#tag-ingredients');
    const ingredientsNamesArr = {};

    // Parcourir les recettes
    recipesParam.forEach(recipeItemData => {
        const recipeItem = formatCardRecipe(recipeItemData);
        const simpleArrIngredientsForOneRecipe = recipeItem.ingredients;

        // parcourir les ingrédients de chaque recette
        simpleArrIngredientsForOneRecipe.forEach(ingredientObj => {
            const nameOfIngredient = ingredientObj.ingredient;
            ingredientsNamesArr[nameOfIngredient] = true;
        })

    })

    const nbrRecipesElement = document.querySelector('#nbr-recipes');
    nbrRecipesElement.textContent = `${recipesParam.length} recette${recipesParam.length > 1 ? 's' : ''}`;

    // récupérer les clés contenus dans le tableau ingredientsNamesArr
    const simpleArrIngredientsForAllRecipes = sortTags(Object.keys(ingredientsNamesArr));

    // créer l'HTML pour les ingredients tag
    function makeIngredientHTML(ingredients) {
        let ingredientsHTML = '';

        // Parcourir les ingrédients et les ajouter à l'HTML
        ingredients.forEach(ingredient => {
            const formattedName = ingredient.charAt(0).toUpperCase() + ingredient.substring(1).toLowerCase();

            ingredientsHTML += `<li class="tag">${formattedName}</li>`;
        });

        // Vérifier si des ingrédients ont été ajoutés et retourner l'HTML approprié
        return ingredientsHTML ? '<ul>' + ingredientsHTML + '</ul>' : '<span>Aucun tag correspondant</span>';
    }
    // Ajouter l'HTML des ingrédients dans la section appropriée du DOM
    ingredientSection.innerHTML += makeIngredientHTML(simpleArrIngredientsForAllRecipes);
}

// Afficher les appareils dans la selectBox
export function displayAppliances(recipesParam) {
    const applianceSection = document.querySelector('#tag-appliances');
    const appliancesNamesArr = new Set();

    // Parcourir les recettes
    recipesParam.forEach(recipeItemData => {
        const recipeItem = formatCardRecipe(recipeItemData);
        const appliance = recipeItem.appliance;

        // Ajouter l'appareil au Set (ensemble)
        appliancesNamesArr.add(appliance);
    });

    // Convertir le Set en tableau et trier les noms d'appareils
    const sortedAppliances = sortTags(Array.from(appliancesNamesArr));

    // Créer l'HTML pour les appareils tag
    function makeApplianceHTML(appliances) {
        let appliancesHTML = '';

        // Parcourir les appareils et les ajouter à l'HTML
        appliances.forEach(appliance => {
            const formattedName = appliance.charAt(0).toUpperCase() + appliance.substring(1).toLowerCase();
            appliancesHTML += `<li class="tag">${formattedName}</li>`;
        });

        // Vérifier si des appareils ont été ajoutés et retourner l'HTML approprié
        return appliancesHTML ? '<ul>' + appliancesHTML + '</ul>' : '<span>Aucun tag correspondant</span>';
    }

    // Ajouter l'HTML des appareils dans la section appropriée du DOM
    applianceSection.innerHTML += makeApplianceHTML(sortedAppliances);
}


// Afficher les ustensiles dans la selectBox
export function displayUstensils(recipesParam) {
    const ustensilsSection = document.querySelector('#tag-ustensils');
    const ustensilsNamesArr = new Set();

    // Parcourir les recettes
    recipesParam.forEach(recipeItemData => {
        const recipeItem = formatCardRecipe(recipeItemData);
        const ustensils = recipeItem.ustensils;

        // Ajouter les ustensiles au Set (ensemble)
        ustensils.forEach(ustensil => {
            ustensilsNamesArr.add(ustensil);
        });
    });

    // Convertir le Set en tableau et trier les noms d'ustensiles
    const sortedUstensils = sortTags(Array.from(ustensilsNamesArr));

    // Créer l'HTML pour les ustensiles tag
    function makeUstensilsHTML(ustensils) {
        let ustensilsHTML = '';

        // Parcourir les ustensiles et les ajouter à l'HTML
        ustensils.forEach(ustensil => {
            const formattedName = ustensil.charAt(0).toUpperCase() + ustensil.substring(1).toLowerCase();
            ustensilsHTML += `<li class="tag">${formattedName}</li>`;
        });

        // Vérifier si des ustensiles ont été ajoutés et retourner l'HTML approprié
        return ustensilsHTML ? '<ul>' + ustensilsHTML + '</ul>' : '<span>Aucun tag correspondant</span>';
    }

    // Ajouter l'HTML des ustensiles dans la section appropriée du DOM
    ustensilsSection.innerHTML += makeUstensilsHTML(sortedUstensils);
}


// Vider le conteneur des recettes
export function clearRecipes() {
    const recipesSection = document.querySelector('#card-container');
    recipesSection.innerHTML = '';
}

// Vider le conteneur des tags ingrédients
export function clearIngredients() {
    const ingredientSection = document.querySelector('#tag-ingredients');
    ingredientSection.innerHTML = '';
}
// Vider le conteneur des tags appareils
export function clearAppliances() {
    const applianceSection = document.querySelector('#tag-appliances');
    applianceSection.innerHTML = '';
}
// Vider le conteneur des tags ustensiles
export function clearUstensiles() {
    const ustensileSection = document.querySelector('#tag-ustensils');
    ustensileSection.innerHTML = '';
}

export function removeSelectedTag(tag) {
    const selectedTagContainer = document.querySelector('#selected-tags');
    const selectedTags = Array.from(selectedTagContainer.querySelectorAll('.selected-tag'));

    // Supprimer le tag de la liste des tags sélectionnés
    const filteredTags = selectedTags.filter(selectedTag => selectedTag.textContent !== tag);
    selectedTagContainer.innerHTML = '';
    filteredTags.forEach(selectedTag => {
        selectedTagContainer.appendChild(selectedTag);
    });

    // Mettre à jour les recettes filtrées
    Index.updateFilteredRecipes();
}

export function restoreTag(tag) {
    const tagContainer = document.querySelector('.tag-ctn');
    const tagElement = document.createElement('li');
    tagElement.classList.add('tag');
    tagElement.textContent = tag;
    tagElement.addEventListener('click', createTagFilter);

    // Ajouter le tag à la liste des tags filtrables
    tagContainer.appendChild(tagElement);
}

export function createTagFilter(event) {
    const selectedTag = event.target.textContent;

    const selectedTagContainer = document.querySelector('#selected-tags');
    const selectedTags = Array.from(selectedTagContainer.querySelectorAll('.selected-tag'));
    const tagAlreadySelected = selectedTags.some(tag => tag.textContent === selectedTag);

    if (tagAlreadySelected) {
        // Supprimer le tag de la liste des tags sélectionnés
        removeSelectedTag(selectedTag);
        // Réinsérer le tag dans la liste des tags filtrables
        restoreTag(selectedTag);
    } else {
        // Ajouter le tag à la liste des tags sélectionnés
        displaySelectedTag(selectedTag);
    }
}

export function displaySelectedTag(tag) {
    const selectedTagContainer = document.querySelector('#selected-tags');

    // Créer un élément HTML pour la vignette du tag
    const tagElement = document.createElement('div');
    tagElement.classList.add('selected-tag');
    tagElement.textContent = tag;

    // Ajouter un bouton de suppression à la vignette
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-tag');
    deleteButton.innerHTML = '&#10005;';
    deleteButton.addEventListener('click', () => {
        selectedTagContainer.removeChild(tagElement);
        Index.updateFilteredRecipes();
    });

    // Ajouter la vignette du tag à la zone de la vignette sélectionnée
    selectedTagContainer.appendChild(tagElement);
    tagElement.appendChild(deleteButton);
}

// mettre un écouteur d'évènement aux filtres tag pour les afficher ou non selon l'intéraction
// pour chaques filtres tag
blockFilters.forEach((blockFilter) => {
    const filterItem = blockFilter.querySelector('.filter-item');
    const filterCtn = blockFilter.querySelector('.filter-ctn');
    const tagCtn = blockFilter.querySelector('.tag-ctn');

    // afficher les listes selon le click de l'utilisater
    filterItem.addEventListener('click', function () {
        if (filterCtn.style.display === 'none') {
            filterCtn.style.display = 'flex';
            tagCtn.style.display = 'block';
        } else {
            filterCtn.style.display = 'none';
            tagCtn.style.display = 'none';
        }
    });
});
