
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
  `setup` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `start` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `end` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `event_name` varchar(255) NOT NULL DEFAULT '',
  `organization_name` varchar(255) NOT NULL DEFAULT '',
  `location_name` varchar(255) NOT NULL DEFAULT '',
  `address_street` varchar(255) NOT NULL DEFAULT '',
  `address_extra` varchar(255) NOT NULL DEFAULT '',
  `zip` varchar(10) NOT NULL DEFAULT '',
  `contact` varchar(100) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `phone` varchar(100) NOT NULL DEFAULT '',
  `cell` varchar(100) NOT NULL DEFAULT '',
  `ada_confirmed` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `special_ballot_needed` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `special_ballot_worker_id` int(11) unsigned NOT NULL DEFAULT 0,
  `in_out` enum('in','out','') NOT NULL DEFAULT '',
  `power_confirmed` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `event_bound` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `staffer1_id` int(11) unsigned NOT NULL DEFAULT 0,
  `staffer2_id` int(11) unsigned NOT NULL DEFAULT 0,
  `staffer3_id` int(11) unsigned NOT NULL DEFAULT 0,
  `precinct` int(4) unsigned NOT NULL DEFAULT 0,
  `district` int(2) unsigned NOT NULL DEFAULT 0,
  `lat` decimal(15,12) NOT NULL,
  `lng` decimal(15,12) NOT NULL,
  `payload` text NOT NULL DEFAULT '',
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
(`id`, `scheduler_id`, `setup`, `start`, `end`, `event_name`, `organization_name`, `location_name`, `address_street`, `zip`, `contact`, `email`, `phone`, `ada_confirmed`,`in_out`,`power_confirmed`,`event_bound`,`published`,`created`,`lat`,`lng`, `precinct`, `district`)
VALUES
('',2,'2019-06-07 10:30:00','2019-06-07 11:00:00','2019-06-07 13:00:00',"","Reading Terminal Market","Reading Terminal Market (Center Court across from Brass Pig)","51 N 12th Street","19107","Lisa Simeo",'','215-922-2317',1,'in',1,0,1,@tnow,'39.95288837147714','-75.1596549196608','0524','01'),
('',2,'2019-06-08 11:45:00','2019-06-08 12:00:00','2019-06-08 16:00:00',"","Free Library","Northeast Regional Library","2228 Cottman Ave","19149","Peter Lehu",'lehup@freelibrary.org','',1,'in',0,0,1,@tnow,'40.048602892121345 ','-75.0614349147055 ','5422','06 '),
('',2,'2019-06-10 12:15:00','2019-06-10 13:00:00','2019-06-10 17:00:00',"","Free Library","Katharine Drexel Library","11099 Knights Rd","19154","Rich Krawczyk",'krawczykr@freelibrary.org','',0,'in',1,0,1,@tnow,'40.08398275800908 ','-74.97346980439947 ','6630','10 '),
('',2,'2019-06-11 14:45:00','2019-06-11 15:00:00','2019-06-11 17:45:00',"","Free Library","Fox Chase Library","501 Rhawn St","19111","Christine Casperson",'caspersonc@freelibrary.org','',1,'in',1,0,1,@tnow,'40.07669320508502 ','-75.08182718839862 ','6303','10 '),
('',2,'2019-06-12 13:15:00','2019-06-12 14:00:00','2019-06-12 00:00:00',"","","Cheltenham Nursing and Rehabilitation Center","600 W Cheltenham Ave","19126","Lisa LoRusso",'llorusso.cnrc@gmail.com','',1,'in',1,0,1,@tnow,'40.056136482031185 ','-75.128588953853 ','6124','09 '),
('',2,'2019-06-13 18:30:00','2019-06-13 19:00:00','2019-06-13 00:00:00',"Burholme Townwatch and Civic Association June Meeting","Burholme Townwatch and Civic Association","Wesley Enhanced Living (Burholme)","7040 Oxford Ave","19111","Aizaz Gill",'burholmecivic@gmail.com','',1,'in',1,1,1,@tnow,'40.05703565274012 ','-75.08657472399788 ','3503','09 '),
('',2,'2019-06-14 09:00:00','2019-06-14 10:00:00','2019-06-14 14:00:00',"State Rep Kinsey Senior Fair","State Rep. Kinsey's Office","The Yorkhouse","5325 Old York Rd","19141","Marcia Hall & Patricia Tisdale",'mhall@pahouse.net; ptisdale@pahouse.net','',1,'in',1,1,1,@tnow,'40.03395806966648 ','-75.14451113590522 ','4921','09 '),
('',2,'2019-06-14 11:00:00','2019-06-14 12:00:00','2019-06-14 15:00:00',"","PHL Veteran's Office","West Philadelphia Senior Community Center","1016 N 41st Street","19104","Wanda Pate",'','',0,'',0,0,1,@tnow,'39.97224279958903 ','-75.20655583790128 ','0614','03 '),
('',2,'2019-06-15 09:00:00','2019-06-15 10:00:00','2019-06-15 13:00:00',"Congressman Brendan Boyle's Senior Expo","Congressman Brendan Boyle's Office","Lincoln High School","3201 Ryan Ave","19136","Anthony Bellmon",'anthony.bellmon@mail.house.gov','',1,'in',0,1,1,@tnow,'40.04406165368262 ','-75.04081976644625 ','6404','06 '),
('',2,'2019-06-15 00:00:00','2019-06-15 10:00:00','2019-06-15 14:00:00',"35th Ward Town Hall and Health Fair","State Rep. Fitzgerald's Office","Lawncrest Recreation Center","6000 Rising Sun Ave","19111","Rodney Baker",'rbaker@pahouse.net','',1,'',1,1,1,@tnow,'40.04668643843953 ','-75.10159351830386 ','3510','09 '),
('',2,'2019-06-15 00:00:00','2019-06-15 11:00:00','2019-06-15 16:00:00',"Disability Pride Philadelphia Parade and Celebration","","City Hall Courtyard","1400 JFK Blvd","19107","Vicki Landers",'disabilitypridephiladelphia@gmail.com','',1,'out',0,1,1,@tnow,'39.952498599605 ','-75.16383689593918 ','0815','05 '),
('',2,'2019-06-17 00:00:00','2019-06-17 13:00:00','2019-06-17 17:00:00',"","Free Library","Chestnut Hill Library","8711 Germantown Ave","19118","Prather Egan",'eganp@freelibrary.org','',0,'in',1,0,1,@tnow,'40.07783805363768 ','-75.20930090989016 ','0907','08 '),
('',2,'2019-06-18 14:30:00','2019-06-18 15:00:00','2019-06-18 19:00:00',"","","South Philadelphia Older Adult Center","1430 E Passyunk Ave","19147","Deborah Hoffer",'deborah.hoffer@phila.gov','',1,'in',1,0,1,@tnow,'39.93166642297133 ','-75.16277174139516 ','0103','01 '),
('',2,'2019-06-18 00:00:00','2019-06-18 19:00:00','2019-06-18 00:00:00',"","Northwood Civic Assocation","Simpson Recreation Center","1010 Arrott Street","19124","Joe Krause",'','',0,'',0,0,1,@tnow,'40.02099041656128 ','-75.09279995540699 ','2304','07 '),
('',2,'2019-06-19 12:45:00','2019-06-19 13:00:00','2019-06-19 17:00:00',"","Free Library","Welsh Road Library","9233 Roosevelt Blvd","19114","Brook Freeman",'freemanb@freelibrary.org','',1,'in',1,0,1,@tnow,'40.07768468983812 ','-75.03135565129259 ','5706','06 '),
('',2,'2019-06-20 14:30:00','2019-06-20 15:00:00','2019-06-20 18:00:00',"","Free Library","Andorra Library","705 E Cathedral Rd","19128","JoAnne Woods",'woodsj@freelibrary.org','',1,'in',1,0,1,@tnow,'40.06436924474755 ','-75.23839977288198 ','2143','04 '),
('',2,'2019-06-20 18:30:00','2019-06-20 19:00:00','2019-06-20 00:00:00',"June Upper Holmesburg Civic Association","Upper Holmesburg Civic Association","St. Dominic's Marian Hall","8512 Frankford Ave","19136","Stanley Cywinski",'','',1,'in',1,1,1,@tnow,'40.04568322843462 ','-75.01639046508951 ','5718','06 '),
('',2,'2019-06-22 10:30:00','2019-06-22 11:00:00','2019-06-22 16:00:00',"Community Carnival and Health Fair","Councilwoman Cherelle Parker's Office","Second Macedonia Baptist Burch","1301 W Ruscomb St","19141","Tascha Chalmers and Michele Smart",'tascha.chalmers@phila.gov or michele.smart@phila.gov','',1,'in',1,1,1,@tnow,'40.029123073099456 ','-75.14493017910269 ','4917','09 '),
('',2,'2019-06-24 00:00:00','2019-06-24 13:00:00','2019-06-24 17:00:00',"","Free Library","Welsh Road Library","9233 Roosevelt Blvd","19114","Brook Freeman",'freemanb@freelibrary.org','',1,'in',1,0,1,@tnow,'40.07768468983812 ','-75.03135565129259 ','5706','06 '),
('',2,'2019-06-25 00:00:00','2019-06-25 15:00:00','2019-06-25 17:45:00',"","Free Library","Whitman Library","200 Snyder Ave","19148","Rachel Solomon",'solomonr@freelibrary.org','',1,'in',1,0,1,@tnow,'39.92121247817907 ','-75.15045016091258 ','3907','01 '),
('',2,'2019-06-25 00:00:00','2019-06-25 19:30:00','2019-06-25 TBD',"Olde Richmond Civic Association June Meeting","Olde Richmond Civic Association","Cione Recreation Center","2600 Aramingo Avenue","19125","Rosemary Thomas",'rthomas@olderichmond.org','',1,'in',1,1,1,@tnow,'39.980492899455534 ','-75.11849362631999 ','3118','01 '),
('',2,'2019-06-26 00:00:00','2019-06-26 13:00:00','2019-06-26 17:00:00',"","Free Library","Falls of Schuylkill Library","3501 Midvale Ave","19129","Meredith McGovern",'mcgovernm@freelibrary.org','',1,'in',1,0,1,@tnow,'40.01428774769581 ','-75.19237285505777 ','3813','04 '),
('',2,'2019-06-27 00:00:00','2019-06-27 18:00:00','2019-06-27 19:30:00',"June Mantua Civic Association Meeting","Mantua Civic Association","Grace Lutheran Church","3529 Haverford Ave","19104","Dwayne Drummond",'mrdrumm25@gmail.com','267-205-1771',1,'in',1,1,1,@tnow,'39.96404081074657','-75.19431952545345','2404','03'),
('',2,'2019-06-28 11:45:00','2019-06-28 12:00:00','2019-06-28 16:00:00',"","Center for Leadership, Development and Advocacy","Machine Demo at Resources for Human Development","4700 Wissahickon Avenue Bldg A Ste 126","19144","Kyle Duncan",'<kyle.duncan@rhd.org>','215-907-1035',1,'in',1,0,1,@tnow,'40.017450980573784 ','-75.17217880406477 ','3817','04 '),
('',2,'2019-07-01 00:00:00','2019-07-01 09:00:00','2019-07-01 16:00:00',"","","National Constitution Center","525 Arch St","19106","Jenna Winterle Kehres",'jwinterle@constitutioncenter.org','',1,'in',1,0,1,@tnow,'39.95271646655728 ','-75.14947124394878 ','0516','01 '),
('',2,'2019-07-02 00:00:00','2019-07-02 09:00:00','2019-07-02 16:00:00',"","","National Constitution Center","525 Arch St","19106","Jenna Winterle Kehres",'jwinterle@constitutioncenter.org','',1,'in',1,0,1,@tnow,'39.95271646655728 ','-75.14947124394878 ','0516','01 '),
('',2,'2019-07-03 00:00:00','2019-07-03 09:00:00','2019-07-03 16:00:00',"","","National Constitution Center","525 Arch St","19106","Jenna Winterle Kehres",'jwinterle@constitutioncenter.org','',1,'in',1,0,1,@tnow,'39.95271646655728 ','-75.14947124394878 ','0516','01 '),
('',2,'2019-07-04 00:00:00','2019-07-04 09:00:00','2019-07-04 16:00:00',"Independence Day @ National Constitution Center","","National Constitution Center","525 Arch St","19106","Jenna Winterle Kehres",'jwinterle@constitutioncenter.org','',1,'in',1,1,1,@tnow,'39.95271646655728 ','-75.14947124394878 ','0516','01 '),
('',2,'2019-07-08 00:00:00','2019-07-08 10:00:00','2019-07-08 11:45:00',"","","St. Anne’s Senior Citizens Center","2607 E Cumberland St","19125","J Scornaienchi",'jscornaienchi@chs-adphila.org','',1,'in',1,0,1,@tnow,'39.97702091831991 ','-75.12031389671317 ','3116','01 '),
('',2,'2019-07-09 12:45:00','2019-07-09 13:00:00','2019-07-09 17:00:00',"","Free Library","Northeast Regional Library","2228 Cottman Ave","19149","Peter Lehu",'lehup@freelibrary.org','',0,'in',0,0,1,@tnow,'40.048602892121345 ','-75.0614349147055 ','5422','06 '),
('',2,'2019-07-10 00:00:00','2019-07-10 09:00:00','2019-07-10 11:00:00',"","","Northeast Older Adult Center (LM)","8101 Bustleton Ave","19152","Tara Bowman",'tara.bowman@phila.gov','',1,'in',1,0,1,@tnow,'40.06138430597694 ','-75.050283533691 ','5620','10 '),
('',2,'2019-07-10 16:30:00','2019-07-10 17:00:00','2019-07-10 20:00:00',"","Free Library","Tacony Library","6742 Torresdale Avenue","19135","Suzin Weber",'webers@freelibrary.org','267-475-0470',1,'in',1,0,1,@tnow,'40.02534336514582 ','-75.04523231107899 ','4112','06 '),
('',2,'2019-07-11 00:00:00','2019-07-11 12:00:00','2019-07-11 15:00:00',"","Free Library","Wadsworth Library","1500 Wadsworth Ave","19150","A Kearney",'kearneya@freelibrary.org','',1,'in',1,0,1,@tnow,'39.952498599605 ','-75.16383689593918 ','0815','05 '),
('',2,'2019-07-12 00:00:00','2019-07-12 00:00:00','2019-07-12 16:00:00',"","Free Library","West Oak Lane Library","2000 Washington Ln","19138","Irene Klemas",'klemasi@freelibrary.org','',1,'in',1,0,1,@tnow,'39.982198689697235 ','-75.10402369218279 ','2501','01 '),
('',2,'2019-07-12 11:00:00','2019-07-12 12:00:00','2019-07-12 15:00:00',"","Councilwoman Jannie Blackwell","City Hall Courtyard","1400 JFK Boulevard","19107","Paulette Adams",'','',0,'',0,0,1,@tnow,'39.94214218847301 ','-75.21870577977916 ','5105','03 '),
('',2,'2019-07-14 13:30:00','2019-07-14 14:00:00','2019-07-14 17:00:00',"Veterans Appreciation BBQ","State Rep. Joe Hohenstein's Office","Veteran's Boxing Assocation","2733 E Clearfield St","19134","Tara Gontek",'tgontek@pahouse.net','215-605-2146',1,'out',1,1,1,@tnow,'40.12141767403233 ','-75.03367360406723 ','5837','10 '),
('',2,'2019-07-15 11:30:00','2019-07-15 12:00:00','2019-07-15 16:00:00',"","Free Library","Kingsessing Library","1201 South 51st Street","19143","Ben Remsen",'','',0,'',0,0,1,@tnow,'39.97602870624292 ','-75.264063812509 ','3441','04 '),
('',2,'2019-07-16 00:00:00','2019-07-16 11:00:00','2019-07-16 14:00:00',"","","Northeast Adult Day Care","11048 Rennard St","19116","Vlada Rubarkh",'vlada_rubarkh@yahoo.com','',1,'in',1,0,1,@tnow,'40.0566582188068 ','-75.18750361726305 ','2211','08 '),
('',2,'2019-07-17 11:30:00','2019-07-17 13:00:00','2019-07-17 17:00:00',"","Free Library","Overbrook Park Library","7422 Haverford Avenue","19151","Tamikka Coppin",'coppint@freelibrary.org','',1,'in',1,0,1,@tnow,'40.09874471904635 ','-75.01172245381593 ','5831','10 '),
('',2,'2019-07-19 00:00:00','2019-07-19 00:30:00','2019-07-19 01:30:00',"","","Juniata Park Older Adult Center","1251 E Sedgley Ave","19134","Matt Comey",'matt.comey@phila.gov','',1,'in',1,0,1,@tnow,'39.994774677836745 ','-75.21812103464613 ','5209','04 '),
('',2,'2019-07-22 00:00:00','2019-07-22 13:00:00','2019-07-22 17:00:00',"","Free Library","Lovett Memorial Library","6945 Germantown Avenue","19119","Marsha Stender",'stenderm@freelibrary.org','',1,'in',1,0,1,@tnow,'40.03599938768462 ','-75.22239222317175 ','2122','04 '),
('',2,'2019-07-23 00:00:00','2019-07-23 13:30:00','2019-07-23 15:00:00',"","","St. John Neumann Center for Rehabilitation & Healthcare (LM)","10400 Roosevelt Blvd","19116","Shannon Weney",'sweney@chg.org','',0,'',0,0,1,@tnow,'40.08398275800908 ','-74.97346980439947 ','4608','10 '),

('',2,'2019-07-27 21:15:00','2019-07-27 10:00:00','2019-07-27 14:00:00',"Annual Hospitalized Veterans Tribute","21st Ward Veterans Association","Gorgas Park","6300 Ridge Avenue","19128","Bruce Hoffman",'brucefhoffman@msn.com','',1,'out',0,1,1,@tnow,'40.10015191931643 ','-75.0218266247816 ','3606','10 '),
('',2,'2019-07-29 00:00:00','2019-07-29 10:00:00','2019-07-29 11:00:00',"","","Star Harbor Senior Community Center","4700 Springfield Ave","19143","Kimberly Beatty",'kimberly beatty <kbeatty@chs-adphila.org>','',1,'in',1,0,1,@tnow,'39.98263334111036 ','-75.10869264634715 ','5803','01 '),
('',2,'2019-07-29 12:30:00','2019-07-29 13:00:00','2019-07-29 17:00:00',"","Free Library","Katharine Drexel Library","11099 Knights Rd","19154","Rich Krawczyk",'','',0,'',0,0,1,@tnow,'40.046037189690146 ','-75.09962355472672 ','2505','09 '),
('',2,'2019-07-30 11:30:00','2019-07-30 12:00:00','2019-07-30 16:00:00',"","Free Library","Queen Memorial Library","1201 S 23rd St","19146","Elizabeth Gardiner",'gardinere@freelibrary.org','732-616-0376',0,'in',1,0,1,@tnow,'40.01575801169381 ','-75.08508155111404 ','3510','07 '),
('',2,'2019-07-31 00:00:00','2019-07-31 09:30:00','2019-07-31 14:00:00',"","","KleinLife","10100 Jamison Ave","19116","Shelley Geltzer",'sgeltzer@kleinlife.org','',1,'in',1,0,1,@tnow,'39.91983247251123 ','-75.17032918975092 ','2306','01 '),
('',2,'2019-08-05 14:45:00','2019-08-05 15:00:00','2019-08-05 19:00:00',"","Free Library","Richmond Library","2987 Almond Street","19134","A Thatcher",'thatchera@freelibrary.org','',1,'in',1,0,1,@tnow,'40.038644683471695 ','-75.07860653276919 ','3925','09 '),
('',2,'2019-08-06 00:00:00','2019-08-06 15:00:00','2019-08-06 19:00:00',"","Free Library","Lawncrest Library","6098 Rising Sun Avenue","19111","Brian Isdell",'isdellb@freelibrary.org','',1,'in',1,0,1,@tnow,'40.09078349590816 ','-75.03222807929919 ','5304','10 '),
('',2,'2019-08-07 23:30:00','2019-08-07 12:00:00','2019-08-07 16:00:00',"","Free Library","Frankford Library","4634 Frankford Avenue","19124","L Daniels",'','',0,'',0,0,1,@tnow,'39.93709136042303 ','-75.15526403299756 ','5814','01 '),
('',2,'2019-08-12 00:00:00','2019-08-12 12:30:00','2019-08-12 16:30:00',"","Free Library","Haverford Library","5543 Haverford Avenue","19139","M DeBose",'debosem@freelibrary.org','',1,'in',1,0,1,@tnow,'39.951570341786095 ','-75.19371022824932 ','0211','03 '),
('',2,'2019-08-12 00:00:00','2019-08-12 15:00:00','2019-08-12 19:00:00',"","Free Library","Fumo Family Library","2437 S Broad St","19148","A Klebanoff",'','',0,'',0,0,1,@tnow,'39.951570341786095 ','-75.19371022824932 ','2719','03 '),
('',2,'2019-08-14 00:00:00','2019-08-14 12:00:00','2019-08-14 16:00:00',"","Free Library","Bushrod Library","6304 Castor Avenue","19149","Mark Wolfe",'wolfem@freelibrary.org','',1,'in',1,0,1,@tnow,'39.993721153306616 ','-75.22251732854004 ','2719','04 '),
('',2,'2019-08-17 10:30:00','2019-08-17 11:00:00','2019-08-17 14:00:00',"7th Police District Community Day","Philadelphia Police","Philadelphia Police 7th District","1701 Bowler St","19115","Officer Joseph Staszak",'joseph.staszak@phila.gov','215-519-2857',1,'out',1,1,1,@tnow,'39.9459750342088 ','-75.16555646238274 ','5212','02 '),
('',2,'2019-08-15 00:00:00','2019-08-15 14:00:00','2019-08-15 17:00:00',"","Free Library","Charles Santore Library","932 South 7th Street","19147","Jean Hamann",'hamannj@freelibrary.org','',1,'in',1,0,1,@tnow,'40.06229071238229 ','-75.04059032498789 ','0814','06 '),
('',2,'2019-08-19 00:00:00','2019-08-19 13:00:00','2019-08-19 17:00:00',"","Free Library","Eastwick Library","2851 Island Avenue","19153","MaryBeth Triplett",'triplettm@freelibrary.org','',1,'in',1,0,1,@tnow,'39.91984832356466 ','-75.17211815583266 ','6415','02 '),
('',2,'2019-08-20 08:30:00','2019-08-20 09:00:00','2019-08-20 17:00:00',"University of Pennsylvania New Student Orientation Student Services Expo","U of Penn, Office of Government Affairs","Houston Hall University of Pennsylvania","3417 Spruce Street","19104","Jordan Gallo",'jordaneg@upenn.edu','215-459-3388',1,'in',1,1,1,@tnow,'40.119143152328185 ','-74.99605511455468 ','2621','10 '),
('',2,'2019-08-21 08:30:00','2019-08-21 09:00:00','2019-08-21 17:00:00',"University of Pennsylvania New Student Orientation Student Services Expo","U of Penn, Office of Government Affairs","Houston Hall University of Pennsylvania","3417 Spruce Street","19104","Jordan Gallo",'jordaneg@upenn.edu','215-459-3388',1,'in',1,1,1,@tnow,'39.95028563578273 ','-75.15245102374342 ','5824','01 '),
('',2,'2019-08-22 13:30:00','2019-08-22 14:00:00','2019-08-22 16:00:00',"","","Kearsley Rehabilitation & Nursing Center (LM)","2100 N 49th St","19131","Lukesha Jeffcoat-Morris",'lmorris@kearsleyrehab.com','215-779-4755',1,'in',1,0,1,@tnow,'40.03629756563141 ','-75.02663869989043 ','0512','06 '),
('',2,'2019-08-23 00:00:00','2019-08-23 11:30:00','2019-08-23 14:00:00',"University of the Arts' Student Activities and Community Engagement Fair","University of the Arts","University of the Arts","320 S Broad St","19102","K Manion",'kmanion@uarts.edu','',1,'in',1,1,1,@tnow,'39.99284899727999 ','-75.14247036481349 ','6517','05 '),
('',2,'2019-08-26 00:00:00','2019-08-26 12:00:00','2019-08-26 16:00:00',"","Free Library","David Cohen Ogontz Library","6017 Ogontz Ave","19141","E Pinder",'pindere@freelibrary.org','',1,'in',1,0,1,@tnow,'40.04298826321135 ','-75.03365469122313 ','3718','06 '),
('',2,'2019-08-28 12:45:00','2019-08-28 13:00:00','2019-08-28 00:00:00',"August Residence Meeting Wesley Enhanced (Pennypack)","","Wesley Enhanced Living (Pennypack)","8401 Roosevelt Blvd","19152","Suzanne Lachman",'slachman@wel.org','',1,'in',1,1,1,@tnow,'39.95271646655728 ','-75.14947124394878 ','6406','01 '),
('',2,'2019-08-29 00:00:00','2019-08-29 10:00:00','2019-08-29 11:30:00',"","","Marconi Older Adults Center","2433 S 15th St","19145","Sally",'sgnoza@caringpeoplealliance.org','',1,'in',1,0,1,@tnow,'40.076310117674176 ','-75.08154651791733 ','0516','10 '),
('',2,'2019-09-07 09:00:00','2019-09-07 10:00:00','2019-09-07 13:00:00',"State Rep Martina White's 5th Annual Kids Fest","State Rep. White's Office","Somerton Youth Organization","1400 Southampton Rd","19116","Kelly Kolodi",'kkolodi@pahousegop.com','215-275-6219',1,'out',0,1,1,@tnow,'40.05535801830738 ','-75.0291835544785 ','6303','06 '),
('',2,'2019-09-09 00:00:00','2019-09-09 12:30:00','2019-09-09 16:30:00',"","Free Library","Independence Library","18 S. 7th Street","19106","Marianne Banbor",'banborm@freelibrary.org','',1,'in',1,0,1,@tnow,'39.97159690978665 ','-75.17639779848177 ','5703','05 '),
('',2,'2019-09-10 00:00:00','2019-09-10 19:00:00','2019-09-10 00:00:00',"","Holmesburg Civic Assocation","Holmesburg Recreation Center","4500 Rhawn St","19136","Tara Gontek",'','',0,'',0,0,1,@tnow,'39.97224279958903 ','-75.20655583790128 ','5823','03 '),
('',2,'2019-09-11 00:00:00','2019-09-11 12:00:00','2019-09-11 16:00:00',"We'll be on main floor","Free Library","Lillian Marrero Library","601 West Lehigh Avenue","19133","Mieka Moody",'moodym@freelibrary.org','',1,'y',1,0,1,@tnow,'40.00500193306581 ','-75.21181212629612 ','1518','04 '),

('',2,'2019-09-17 00:00:00','2019-09-17 08:30:00','2019-09-17 15:00:00',"Constitution Day @ National Constitution Center","","National Constitution Center","525 Arch St","19106","Jenna Winterle Kehres",'jwinterle@constitutioncenter.org','',1,'',0,1,1,@tnow,'40.00500193306581 ','-75.21181212629612 ','5207','04 '),
('',2,'2019-09-19 10:30:00','2019-09-19 11:00:00','2019-09-19 00:00:00',"Saint Cecilias Senior Group Meeting","St Cecilias Senior Group","St. Cecilias School","525 Rhawn St","19111","Maryanne Stround and Eleanor Kerwick",'eleanor.kerwick@stceciliafc.org','',0,'in',1,1,1,@tnow,'39.951757016845','-75.15407936869745','0524','01'),
('',2,'2019-09-25 00:00:00','2019-09-25 13:30:00','2019-09-25 15:00:00',"","","Immaculate Mary Center for Rehabilitation & Healthcare","2990 Holme Ave","19136","Brooke Keats",'bkeats@chg.org','215-335-2100',1,'in',1,0,1,@tnow,'40.05535801830738','-75.0291835544785','5703','06'),
('',2,'2019-09-25 18:30:00','2019-09-25 19:00:00','2019-09-25 00:00:00',"September meeting for Greater Bustleton Civic League","Greater Bustleton Civic League","American Heritage Federal Credit Union","2060 Red Lion Road","19115","Jack o'Hara",'jackohara1@aol.com','',1,'in',1,1,1,@tnow,'40.09853344453133','-75.02205018425592','5823','10'),
('',2,'2019-09-26 00:00:00','2019-09-26 19:30:00','2019-09-26 00:00:00',"September meeting for Fairmount Civic Assocation","Fairmount Civic Assocation","The CIty School","860 N 24th St","19130","Bruce Butler",'thebutlers@aol.com','',1,'in',1,1,1,@tnow,'39.97159690978665','-75.17639779848177','1518','05'),
('',2,'2019-09-28 00:00:00','2019-09-28 12:00:00','2019-09-28 16:00:00',"","Free Library","Oak Lane Library","6614 North 12th Street","19126","D Ahrens",'ahrensd@freelibrary.org','',1,'in',1,0,1,@tnow,'40.054581523434834','-75.1378160420963','6121','09'),
('',2,'2019-10-09 10:30:00','2019-10-09 11:00:00','2019-10-09 12:00:00',"","","LCFS West Philadelphia Senior Center","1016 N 41st St","19104","Julia Diggs",'juliad@lcfsinpa.org','',1,'in',1,0,1,@tnow,'39.97224279958903','-75.20655583790128','0614','03'),
('',2,'2019-10-15 11:00:00','2019-10-15 12:00:00','2019-10-15 13:00:00',"","IBX","Courtyard Marriott","4001 Presidential Boulevard","19131","Latoya Abdus-Salaam",'','267-675-1628',0,'',0,0,1,@tnow,'40.00500193306581','-75.21181212629612','5207','04')