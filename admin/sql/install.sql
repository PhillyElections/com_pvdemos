
/* ==================== constants ==================== */
SET @tnow = NOW();
SET @_start  = '2019-05-20 15:00:00';
SET @_end  = '2019-05-20 17:00:00';
SET @tnl  = '0000-00-00 00:00:00';
SET @tns  = '0000-00-00';
SET @db   = DATABASE();

/* ==================== tables ==================== */

CREATE TABLE IF NOT EXISTS `#__pv_demos_events` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `scheduler_id` int(11) unsigned NOT NULL DEFAULT 0,
  `start` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `end` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `name` varchar(255) NOT NULL DEFAULT '',
  `location` varchar(255) NOT NULL DEFAULT '',
  `address_street` varchar(255) NOT NULL DEFAULT '',
  `address_extra` varchar(255) NOT NULL DEFAULT '',
  `zip` varchar(10) NOT NULL DEFAULT '',
  `contact` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `phone` varchar(100) NOT NULL DEFAULT '',
  `ada_confirmed` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `special_ballot_needed` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `special_ballot_worker_id` int(11) unsigned NOT NULL DEFAULT 0,
  `staffer1_id` int(11) unsigned NOT NULL DEFAULT 0,
  `staffer2_id` int(11) unsigned NOT NULL DEFAULT 0,
  `staffer3_id` int(11) unsigned NOT NULL DEFAULT 0,
  `precinct` int(4) unsigned NOT NULL DEFAULT 0,
  `lat` decimal(15,12) NOT NULL,
  `lng` decimal(15,12) NOT NULL,
  `published` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `created` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `#__pv_demos_workers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job` enum('demoer','scheduler','balloter') NOT NULL DEFAULT 'scheduler',
  `name` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `phone` varchar(100) NOT NULL DEFAULT '',
  `published` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `created` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `#__pv_demos_workers` 
(`id`, `job`, `name`, `email`, `phone`, `published`, `created`)
VALUES
('', 'demoer', 'Matthew Murphy', 'matthew.e.murphy@phila.gov', '2151231234', 1, @tnow),
('', 'scheduler', 'Greg Irving', 'gregory.irving@phila.gov', '2151231234', 1, @tnow),
('', 'scheduler', 'Trina Bodink', 'trina.bodink@phila.gov', '2151231234', 1, @tnow),
('', 'scheduler', 'Aizaz Gill', 'aizaz.gill@phila.gov', '2151231234', 1, @tnow),
('', 'balloter', 'Eric Kapenstein', 'eric.kapenstein@phila.gov', '2151231234', 1, @tnow),
('', 'balloter', 'Garrett Deitz', 'garrett.deitz@phila.gov', '2151231234', 1, @tnow);

INSERT INTO `#__pv_demos_events` 
(`id`, `scheduler_id`, `start`, `end`, `name`, `location`, `address_street`, `zip`, `contact`, `email`, `phone`, `ada_confirmed`, `special_ballot_needed`, `published`, `created`)
VALUES
('', 2, @_start, @_end, 'super groovy event', 'super groovy event location', '3365 Vaux St', '19123', 'Some Guy', 'mattyhead@google.com', '234-234-1234', 1, 1, 1, @tnow)