-- ============================================
-- Migrasi #001: MySQL / MariaDB
-- Database: db_inventaris_pabrik
-- ============================================

USE db_inventaris_pabrik;

CREATE TABLE IF NOT EXISTS master_barang (
    sku VARCHAR(50) PRIMARY KEY,
    nama_barang VARCHAR(255) NOT NULL,
    kategori_barang VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mutasi_inventaris (
    sku VARCHAR(50) PRIMARY KEY,

    national_inv DOUBLE DEFAULT 0,
    lead_time DOUBLE DEFAULT 0,
    in_transit_qty DOUBLE DEFAULT 0,
    forecast_3_month DOUBLE DEFAULT 0,
    forecast_6_month DOUBLE DEFAULT 0,
    forecast_9_month DOUBLE DEFAULT 0,
    sales_1_month DOUBLE DEFAULT 0,
    sales_3_month DOUBLE DEFAULT 0,
    sales_6_month DOUBLE DEFAULT 0,
    sales_9_month DOUBLE DEFAULT 0,
    min_bank DOUBLE DEFAULT 0,
    potential_issue DOUBLE DEFAULT 0,
    pieces_past_due DOUBLE DEFAULT 0,
    perf_6_month_avg DOUBLE DEFAULT -99,
    perf_12_month_avg DOUBLE DEFAULT -99,
    local_bo_qty DOUBLE DEFAULT 0,
    deck_risk DOUBLE DEFAULT 0,
    oe_constraint DOUBLE DEFAULT 0,
    ppap_risk DOUBLE DEFAULT 0,
    stop_auto_buy DOUBLE DEFAULT 0,
    rev_stop DOUBLE DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_mutasi_master
        FOREIGN KEY (sku)
        REFERENCES master_barang(sku)
        ON DELETE CASCADE,

    INDEX idx_mutasi_inv_national (national_inv)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS log_prediksi (
    sku VARCHAR(50) PRIMARY KEY,
    probabilitas_backorder DECIMAL(5,2) NOT NULL,
    status_bahaya BOOLEAN NOT NULL DEFAULT FALSE,
    tanggal_prediksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_master
        FOREIGN KEY (sku)
        REFERENCES master_barang(sku)
        ON DELETE CASCADE,

    INDEX idx_log_prediksi_prob (probabilitas_backorder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;