# Weather Widget | README

## Project Setup

### API

#### Instantiating the SQLite Database

1. Open a terminal in the `weather-api` directory.
2. Run the following command to initialize the database:

    ```bash
    php init_db.php
    ```

#### Installing Composer

1. Open a terminal in the `weather-api` directory.
2. Run the following command to initialize the database:

    ```bash
    composer install
    ```

#### Starting the Server

1. Open a terminal in the `weather-api` directory.
2. Run the following command to start a local server on port `8000`:

    ```bash
    php -S localhost:8000
    ```

### Frontend

1. Open a terminal in the `weather-widget` directory.
2. Install all dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

    The widget will be available at [http://localhost:5173/](http://localhost:5173/).

## Why I Made These Choices

-   **Why I chose React for the widget:**
    I chose React for its ease of use with components and because this is a small, self-contained widget.

-   **Why I did not use a UI library like Tailwind or Mantine:**
    I wanted the widget to be as minimal as possible, ensuring it fits seamlessly into any React project without extra styling dependencies.

-   **Why I chose plain PHP instead of a framework like Laravel:**
    PHP is lightweight and easy to set up for this small project. It’s ideal for simple caching of small amounts of data without the overhead of a full framework.

## Limitations and Future Improvements

-   **Scalability:** The widget could show more data depending on its size (width/height).
-   **API Rate Limits:** The Tomorrow API allows only 25 requests per hour and 500 per day. Caching mitigates this, but a larger user base could still hit the limit.
-   **Expanded Data:** Currently, the widget keeps data minimal for clarity. Future iterations could include more detailed predictions in a user-friendly way.
