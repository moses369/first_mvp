# [MVP Shopping Lists](https://shopping-list-heur.onrender.com/#)

## About
 My very first full stack app, I had a very fun time creating this application and deepened my understanding about how the frontend and backend of an application interacts with each other. The goal was to create our very first Minimal Viable Product integrating persistent storage through PostgreSql, while running on a express server following REST standards. As my first full stack app I wanted to create something useful while, keeping it basic. It does not have any e-commerce functionality as the goal was to create a basic MVP versus a fully functional e-commerce store. I thoroughly enjoyed my time creating this app and can not wait to keep improving and learn further.    

## Purpose
 Provide users the ability to create a shopping list and organize their shopping experience.


## Features
-  Users shop based off of their lists, items are crossed off their list as they are added to the shopping cart.
- If an user no longers wants an Item they are able to remove all products in their cart by deleting the related word in their shopping lists.
- Users are able to edit the quanity of a product in their cart from anywhere the product is listed, and will populate as already in the cart if an item is re-queried.
-  The prices will automatically update whenever the qty is changed, while in the cart and prior allowing users the ability to preview the cost of an item without having to place it in their cart. 


## Lessons Learned
- Seperating your functions by comments describing their purpose helps maintain awareness of each functions purpose when refactoring and improves overall understanding.
- For some reason when JQuery form events are fired off they send off multiple results based on how many times they have have been cicked, prior. In order to accomodate I had to utilize ` $('element').unbind('event').bind('event',callback function)` in order to only get it to fire off once. Subsequentially on input change events the very first change is not picked up for some reason.
- HTML data-sets are very valuable when interacting with the DOM, and storing information regarding elements to interact with the backend.
- Creating your functionality first and then styling after, may cause issues as elements are no longer in the same hierarchy, however utilizing `element.closest('element')` may possibly resolve any hierachly issues.
- How to properly utilize an OAuth token when making API calls, and utilize my server as a proxy in order to bypass the CORS error.



### Code Stack
- JavaScript
- CSS
- HTML
- Postgres
- NodeJs
- Jquery
- Express
- PostrgeSql
