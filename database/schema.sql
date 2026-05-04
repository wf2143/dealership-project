-- =============================================================
--  Michael's Auto Sales — dealership_db
--  Full schema: tables, indexes, view, trigger, stored procedure,
--  seed data, and representative CRUD queries.
--
--  Run with:  mysql -u root -p < schema.sql
-- =============================================================

DROP DATABASE IF EXISTS dealership_db;
CREATE DATABASE dealership_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE dealership_db;

-- -------------------------------------------------------------
--  TABLE: app_user  (employees who log in to the system)
-- -------------------------------------------------------------
CREATE TABLE app_user (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    username   VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(255),
    role       VARCHAR(100),
    start_date VARCHAR(50),
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_username (username),
    UNIQUE KEY uq_user_email    (email)
);

-- -------------------------------------------------------------
--  TABLE: customer
-- -------------------------------------------------------------
CREATE TABLE customer (
    customer_id BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(200),
    phone       VARCHAR(20),
    email       VARCHAR(255),
    PRIMARY KEY (customer_id),
    UNIQUE KEY uq_customer_phone (phone),
    UNIQUE KEY uq_customer_email (email)
);

-- -------------------------------------------------------------
--  TABLE: vehicle
-- -------------------------------------------------------------
CREATE TABLE vehicle (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    vin         VARCHAR(17),
    make        VARCHAR(100),
    model       VARCHAR(100),
    trim        VARCHAR(100),
    color       VARCHAR(50),
    year        INT,
    mileage     INT,
    price       DOUBLE,
    body_type   VARCHAR(50),
    fuel_type   VARCHAR(50),
    status      VARCHAR(50) DEFAULT 'available',
    lot         VARCHAR(10),
    days_on_lot INT         DEFAULT 0,
    add_date    DATE,
    change_date DATE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_vehicle_vin (vin)
);

-- -------------------------------------------------------------
--  TABLE: transaction  (backtick-quoted — reserved word in MySQL)
-- -------------------------------------------------------------
CREATE TABLE `transaction` (
    transaction_id BIGINT     NOT NULL AUTO_INCREMENT,
    date           DATE,
    amount         DOUBLE,
    payment_type   VARCHAR(50),
    customer_id    BIGINT,
    vehicle_id     BIGINT,
    PRIMARY KEY (transaction_id),
    CONSTRAINT fk_txn_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id),
    CONSTRAINT fk_txn_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicle  (id)
);

-- =============================================================
--  NON-PRIMARY INDEXES
--  Chosen to accelerate the most frequent queries in the app:
--  inventory filtering by status/make and sorting by price/date.
-- =============================================================

-- Inventory page filters by status (available, hold, sold, incoming)
CREATE INDEX idx_vehicle_status      ON vehicle (status);

-- Inventory sidebar filters by make
CREATE INDEX idx_vehicle_make        ON vehicle (make);

-- Covers the combined status + make filter in one index scan
CREATE INDEX idx_vehicle_status_make ON vehicle (status, make);

-- Inventory table is sortable by date added
CREATE INDEX idx_vehicle_add_date    ON vehicle (add_date);

-- Inventory table is sortable by price
CREATE INDEX idx_vehicle_price       ON vehicle (price);

-- Sales page sorts/filters transactions by date
CREATE INDEX idx_transaction_date    ON `transaction` (date);

-- =============================================================
--  VIEW: sale_summary
--  Joins transaction -> customer -> vehicle for reporting.
-- =============================================================
CREATE VIEW sale_summary AS
    SELECT
        t.transaction_id,
        t.date,
        t.amount,
        t.payment_type,
        c.customer_id,
        c.name        AS customer_name,
        c.phone       AS customer_phone,
        v.id          AS vehicle_id,
        v.year        AS vehicle_year,
        v.make        AS vehicle_make,
        v.model       AS vehicle_model,
        v.vin         AS vehicle_vin,
        v.price       AS list_price
    FROM `transaction` t
    JOIN customer c ON t.customer_id = c.customer_id
    JOIN vehicle  v ON t.vehicle_id  = v.id;

-- =============================================================
--  TRIGGER: trg_mark_vehicle_sold
--  After a transaction is inserted, automatically marks the
--  associated vehicle status as 'sold'.
-- =============================================================
DELIMITER $$
CREATE TRIGGER trg_mark_vehicle_sold
    AFTER INSERT ON `transaction`
    FOR EACH ROW
BEGIN
    UPDATE vehicle
    SET    status      = 'sold',
           change_date = CURDATE()
    WHERE  id          = NEW.vehicle_id
      AND  status      = 'available';
END$$
DELIMITER ;

-- =============================================================
--  STORED PROCEDURE: GetInventorySummary
--  Returns count, average, min, max, and total lot value
--  grouped by vehicle status. Used for management reporting.
-- =============================================================
DELIMITER $$
CREATE PROCEDURE GetInventorySummary()
BEGIN
    SELECT
        status,
        COUNT(*)   AS vehicle_count,
        AVG(price) AS avg_price,
        MIN(price) AS min_price,
        MAX(price) AS max_price,
        SUM(price) AS total_value
    FROM vehicle
    GROUP BY status
    ORDER BY FIELD(status, 'available', 'hold', 'incoming', 'sold');
END$$
DELIMITER ;

-- =============================================================
--  SEED DATA
-- =============================================================

-- Employees (password for all demo accounts: demo123)
INSERT INTO app_user (id, first_name, last_name, username, password, role, email, start_date)
VALUES
    (1001, 'Jerry',       'Mouse',      'jmouse',      'demo123', 'Sales Associate', 'j.mouse@dealership.com',      '2020-01-15'),
    (1002, 'Tom',         'Cat',        'tcat',        'demo123', 'Finance Manager', 't.cat@dealership.com',        '2019-06-01'),
    (1003, 'Mickey',      'Michaels',   'mmichaels',   'demo123', 'General Manager', 'm.michaels@dealership.com',   '2018-03-10'),
    (1004, 'Minnie',      'MouseHouse', 'mmousehouse', 'demo123', 'Service Advisor', 'm.mousehouse@dealership.com', '2021-09-20'),
    (1005, 'Jeffrey',     'Palmer',     'jpalmer',     'demo123', 'Lot Manager',     'j.palmer@dealership.com',     '2020-11-05'),
    (1006, 'Jean-Michel', 'Basquiat',   'jbasquiat',   'demo123', 'Sales Associate', 'j.basquiat@dealership.com',   '2022-04-18');

-- Vehicles
INSERT INTO vehicle (id, vin, make, model, color, year, mileage, price, body_type, fuel_type, status, lot, days_on_lot, add_date)
VALUES
    (1, '1NKCMUEX8BR285459', 'Ford',      'F-150',      'Black', 1990, 120000,  7000.00, 'Truck', 'Gas',    'available', 'A', 0, CURDATE()),
    (2, '1FTSF30Y75E471696', 'Honda',     'Accord',     'Red',   2020,  30000, 25000.00, 'Sedan', 'Gas',    'available', 'A', 0, CURDATE()),
    (3, '2FAPP36X6JB175858', 'Chrysler',  'Sebring',    'Blue',  2013,  59000, 21000.00, 'Coupe', 'Gas',    'available', 'B', 0, CURDATE()),
    (4, '1M2AM20C94M003987', 'Ford',      'Expedition', 'Black', 1990, 234000,  7500.00, 'SUV',   'Gas',    'available', 'B', 0, CURDATE()),
    (5, '1GCEC14Z77Z197928', 'Chevrolet', '2500',       'Green', 2011, 264000, 10000.00, 'Truck', 'Diesel', 'available', 'C', 0, CURDATE());

-- Customers
INSERT INTO customer (customer_id, name, phone, email)
VALUES
    (1, 'John Smith',      '555-300-0001', 'j.smith@email.com'),
    (2, 'James Doe',       '555-300-0002', 'j.doe@email.com'),
    (3, 'Kate Mclaughlin', '555-300-0003', 'k.mclaughlin@email.com'),
    (4, 'Kim Paul',        '555-300-0004', 'k.paul@email.com'),
    (5, 'Leon Silva',      '555-300-0005', 'l.silva@email.com');

-- Transactions (trigger fires on insert and marks vehicle sold)
INSERT INTO `transaction` (transaction_id, date, amount, payment_type, customer_id, vehicle_id)
VALUES
    (1, CURDATE(),  8500.00, 'Credit', 2, 1),
    (2, CURDATE(), 24988.00, 'Cash',   2, 3);

-- =============================================================
--  REPRESENTATIVE CRUD QUERIES
-- =============================================================

-- SELECT: full inventory list (Inventory page)
SELECT * FROM vehicle;

-- SELECT: filter by status (Inventory sidebar)
SELECT * FROM vehicle WHERE status = 'available';

-- SELECT: filter by make (Inventory sidebar)
SELECT * FROM vehicle WHERE make = 'Ford';

-- SELECT: combined status + make filter
SELECT * FROM vehicle WHERE status = 'available' AND make = 'Ford';

-- SELECT: sort by price
SELECT * FROM vehicle ORDER BY price ASC;

-- SELECT: sort by date added
SELECT * FROM vehicle ORDER BY add_date DESC;

-- SELECT: all sales with customer and vehicle detail (Sales page via view)
SELECT * FROM sale_summary;

-- SELECT: sales filtered by payment type
SELECT * FROM sale_summary WHERE payment_type = 'Cash';

-- SELECT: employee login lookup
SELECT * FROM app_user WHERE username = 'jmouse';

-- SELECT: inventory summary by status (stored procedure)
CALL GetInventorySummary();

-- INSERT: add a new vehicle
INSERT INTO vehicle (vin, make, model, trim, color, year, mileage, price, body_type, fuel_type, status, lot, add_date, change_date)
VALUES ('1HGCM82633A004352', 'Toyota', 'Camry', 'LE', 'White', 2022, 15000, 22000.00, 'Sedan', 'Gas', 'available', 'A', CURDATE(), CURDATE());

-- INSERT: add a new customer
INSERT INTO customer (name, phone, email)
VALUES ('Sarah Connor', '555-300-0099', 's.connor@email.com');

-- INSERT: record a sale (trigger fires, vehicle auto-marked 'sold')
INSERT INTO `transaction` (date, amount, payment_type, customer_id, vehicle_id)
VALUES (CURDATE(), 22000.00, 'Finance', 3, 4);

-- UPDATE: place a vehicle on hold
UPDATE vehicle SET status = 'hold', change_date = CURDATE() WHERE id = 2;

-- UPDATE: adjust a vehicle's asking price
UPDATE vehicle SET price = 9500.00, change_date = CURDATE() WHERE id = 5;

-- UPDATE: promote an employee
UPDATE app_user SET role = 'Finance Manager' WHERE username = 'jmouse';

-- DELETE: remove a vehicle from inventory
DELETE FROM vehicle WHERE id = 6;

-- DELETE: remove a customer record
DELETE FROM customer WHERE customer_id = 6;
