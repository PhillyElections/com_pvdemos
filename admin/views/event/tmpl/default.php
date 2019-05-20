<?php
// no direct access
defined('_JEXEC') or die('Restricted access');

jimport("pvcombo.PVCombo");
jimport( 'joomla.html.html' );

if (count(JRequest::getVar('msg', null, 'post'))) {
    foreach (JRequest::getVar('msg', null, 'post') as $msg) {
        JError::raiseWarning(1, $msg);
    }
}


$object = new stdClass();
$id = "id";
$name = "name";
$object->$id="AM";
$object->$name="AM";
$am_pms[]=$object;
$object = new stdClass();
$object->$id="PM";
$object->$name="PM";
$am_pms[]=$object;

$hours = [];
$minutes = [];
$id = "id";
$name = "name";
for ($i = 0; $i < 60; $i=$i+5) {
    $object = new stdClass();
    $id = "id";
    $name = "name";
    $formatted = sprintf("%02d",$i);
    $object->$id = $formatted;
    $object->$name = $formatted;
    $minutes[]=$object;
}
for ($i = 1; $i <= 12; $i++) {
    $object = new stdClass();
    $id = "id";
    $name = "name";
    $formatted = sprintf("%02d",$i);
    $object->$id = $formatted;
    $object->$name = $formatted;
    $hours[]=$object;
}

// try to cast to object next
$event = !$this->isNew ? $this->event : (object) JRequest::get('post');

$document = JFactory::getDocument();

$document->addStyleSheet('//unpkg.com/leaflet@1.3.1/dist/leaflet.css');
$document->addStyleSheet('https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css');
$document->addStyleSheet('components/com_pvdemos/assets/css/main.css');

?>
<script type="text/javascript">
  var baseUri = "<?php echo JURI::base(); ?>";
</script>

<form action="<?=JRoute::_('index.php?option=com_pvdemos');?>" method="post" id="adminForm" name="adminForm" class="form-validate">
  <div class="right fifty-five">
    <input name="target" id="target" />
    <div id="map-canvas"></div>
    <p>Click to set:
      <ul class="markers">
        <li class="marker" data-marker="building"><img src="components/com_pvdemos/assets/images/b.png" /> <?=JText::_('BUILDING');?></li>
        <li class="marker" data-marker="entrance"><img src="components/com_pvdemos/assets/images/e.png" /><?=JText::_('MAIN ENTRANCE');?></li>
        <li class="marker" data-marker="accessible"><img src="components/com_pvdemos/assets/images/h.png" /><?=JText::_('ACCESSIBLE ENTRANCE');?></li>
        <li class="marker-cancel"><img src="components/com_pvdemos/assets/images/x.png" /><?=JText::_('STOP PLACING MARKERS');?></li>
        <li class="marker-clear"><?=JText::_('CLEAR MARKERS');?></li>
      </ul>
    </p>
  </div>
  <div class="left">
<?php
if (($place->id - 1)):
?>
    <div class="left">
        <a title="<?=JText::_('SKIP TO DIVISION');?> Previous" class="btn" href="<?=JRoute::_('index.php?option=com_pvdemos&controller=event&task=edit&cid[]=' . ($event->id - 1));?>" ><?=JText::_('PREVIOUS');?></a>
    </div>
<?php
endif;
if (($event->id + 1)):
?>
    <div class="right">
      <a title="Skip to division: Next" class="btn" href="<?=JRoute::_('index.php?option=com_pvdemos&controller=event&task=edit&cid[]=' . ($event->id + 1));?>" ><?=JText::_('NEXT');?></a>
    </div>
<?php
endif;
?>
  <div class="clearfix"></div>    
    <table cellpadding="0" cellspacing="0" border="0" class="adminform">
        <tbody>
            <tr>
                <td width="200" height="30">
                    <label id="idmsg" for="id">
                        <?=JText::_('ID');?>:
                    </label>
                </td>
                <td>
                    <?php echo $event->id; ?>
                </td>
            </tr>
             <tr>
                <td width="200" height="30">
                    <label id="publishedmsg" for="published">
                        <?=JText::_('PUBLISHED');?>:
                    </label>
                </td>
                <td>
                    <?php echo JHTML::_('select.booleanlist', 'published', 'class="inputbox"', $event->published); ?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="scheduler_idmsg" for="secheduler_id">
                        <?=JText::_('SCHEDULER');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', 'Select scheduler'), 'scheduler_id', '', 'idx', 'value', ($event->scheduler_id ? $event->scheduler_id : ''), 'scheduler_id');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="daymsg" for="day">
                        <?=JText::_('TIMES');?>:
                    </label>
                </td>
                <td>
                    <table><tr><td>Day:</td><td><?php echo JHTML::_ ( 'calendar', date("Y-m-d", strtotime($event->start)), "day", "day", '%Y-%m-%d', 'size="8"' );?></td></tr>
                    <tr><td>Start:</td><td><?=JHTML::_('select.genericlist', PVCombo::getsFromObject($hours, 'id', 'name'), 'start_hour', '', 'idx', 'value', ($event->start_hour ? $event->start_hour : '01'), 'start_hour');?>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($minutes, 'id', 'name'), 'start_minute', '', 'idx', 'value', ($event->start_minute ? $event->start_minute : '00'), 'start_minute');?>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($am_pms, 'id', 'name'), 'start_am_pm', '', 'idx', 'value', ($event->start_am_pm ? $event->start_am_pm : 'PM'), 'start_am_pm');?></td></tr>
                    <tr><td>End:</td><td><?=JHTML::_('select.genericlist', PVCombo::getsFromObject($hours, 'id', 'name'), 'end_hour', '', 'idx', 'value', ($event->end_hour ? $event->end_hour : '03'), 'end_hour');?>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($minutes, 'id', 'name'), 'end_minute', '', 'idx', 'value', ($event->end_minute ? $event->end_minute : '00'), 'end_minute');?>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($am_pms, 'id', 'name'), 'end_am_pm', '', 'idx', 'value', ($event->end_am_pm ? $event->end_am_pm : 'PM'), 'end_am_pm');?></td></tr></table>
                </td>
            </tr>
             <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="name">
                        <?=JText::_('EVENT NAME');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="name" name="name" size="62" value="<?=$event->name;?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('EVENT NAME PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="locationmsg" for="location">
                        <?=JText::_('LOCATION NAME');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="location" name="location" size="62" value="<?=$event->location ;?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('LOCATION NAME PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="address_streetmsg" for="address_street">
                        <?=JText::_('ADDRESS STREET');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="address_street" name="address_street" size="62" value="<?=$event->address_street ;?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('ADDRESS STREET PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="address_extramsg" for="address_extra">
                        <?=JText::_('ADDRESS EXTRAS');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="address_extra" name="address_extra" size="62" value="<?=$event->address_extra ;?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('ADDRESS EXTRAS PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="geocodingramsg" for="geocoding">
                        <?=JText::_('GEOCODING');?>:
                    </label>
                </td>
                <td>
<?php
if ($event->lat > 0) :
?>
                    <table>
                        <tr>
                            <td>Coord:</td><td id="display-building"><?=$event->lat ;?>, <?=$event->lng ;?></td>
                        </tr> 
                        <tr>
                            <td>Precinct:</td><td id="display-precint"><?=$event->precinct ;?></td>
                        </tr> 
                        </tr> 
                    </table>
<?php
else :
?>
                    <div id="geocodeme_container">Geocoding has not yet been set.  <div class="button" id="geocodeme">GEOCODE</div></div>
                    <table id="geocoded_container" class="hidden">
                        <tr>
                            <td colspan="2" class="info">Note: please update or save this record to write these values.</td>
                        </tr>
                        <tr>
                            <td>Coord:</td><td id="display-building">{LAT}, {LNG}</td>
                        </tr> 
                        <tr>
                            <td>Precinct:</td><td id="display-precinct">{PRECINT}</td>
                        </tr> 
                        </tr> 
                    </table>

<?php
endif;
?>
                    <input type="hidden" name="precinct" id="precinct" value="<?=$event->precinct ;?>" />
                    <input type="hidden" name="lat" id="lat" value="<?=$event->lat ;?>" />
                    <input type="hidden" name="lng" id="lng" value="<?=$event->lng ;?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="contactmsg" for="contact">
                        <?=JText::_('CONTACT');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="contact" name="contact" size="62" value="<?=$event->contact ;?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('CONTACT PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="phonemsg" for="phone">
                        <?=JText::_('PHONE');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="phone" name="phone" size="62" value="<?=$event->phone ;?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('PHONE PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="emailmsg" for="email">
                        <?=JText::_('EMAIL');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="email" name="email" size="62" value="<?=$event->email ;?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('EMAIL PLACEHOLDER');?>" />
                </td>
            </tr>
             <tr>
                <td width="200" height="30">
                    <label id="ada_compliantmsg" for="ada_compliant">
                        <?=JText::_('ADA COMPLIANT');?>:
                    </label>
                </td>
                <td>
                    <?php echo JHTML::_('select.booleanlist', 'ada_compliant', 'class="inputbox"', $event->ada_compliant); ?>
                </td>
            </tr>
             <tr>
                <td width="200" height="30">
                    <label id="special_ballot_neededmsg" for="special_ballot_needed">
                        <?=JText::_('SPECIAL BALLOT NEEDED');?>:
                    </label>
                </td>
                <td>
                    <?php echo JHTML::_('select.booleanlist', 'special_ballot_needed', 'class="inputbox"', $event->special_ballot_needed); ?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="special_ballot_worker_idmsg" for="special_ballot_worker_id">
                        <?=JText::_('SPECIAL BALLOT HANDLER');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', '- assign staff -'), 'special_ballot_worker_id', '', 'idx', 'value', ($event->special_ballot_worker_id ? $event->special_ballot_worker_id : ''), 'classspecial_ballot_worker_id');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="staffer1_idmsg" for="staffer1_id">
                        <?=JText::_('ASSIGNED STAFF 1');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', '- assign staff -'), 'staffer1_id', '', 'idx', 'value', ($event->staffer1_id ? $event->staffer1_id : ''), 'staffer1_id');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="staffer2_idmsg" for="staffer2_id">
                        <?=JText::_('ASSIGNED STAFF 2');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', '- assign staff -'), 'staffer2_id', '', 'idx', 'value', ($event->staffer2_id ? $event->staffer2_id : ''), 'staffer2_id');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="staffer3_idmsg" for="staffer3_id">
                        <?=JText::_('ASSIGNED STAFF 3');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', '- assign staff -'), 'staffer3_id', '', 'idx', 'value', ($event->staffer3_id ? $event->staffer3_id : ''), 'staffer3_id');?>
                </td>
            </tr>
            <tr>
                <td height="30">&nbsp;</td>
                <td>
                    <button class="button validate" type="submit"><?=$this->isNew ? JText::_('SUBMIT') : JText::_('UPDATE');?></button>
                    <input type="hidden" name="task" value="<?=$this->isNew ? 'save' : 'update';?>" />
                    <input type="hidden" name="controller" value="event" />
                    <input type="hidden" name="id" value="<?=$event->id;?>" />
                    <?=JHTML::_('form.token');?>
                </td>
            </tr>
        </tbody>
    </table>
</form>
<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
<script src="//unpkg.com/leaflet@1.3.1/dist/leaflet.js"></script>
<script src="components/com_pvdemos/assets/js/leaflet.print.js"></script>
<script src="https://unpkg.com/esri-leaflet@2.1.3/dist/esri-leaflet.js"></script>
<script src='https://npmcdn.com/@turf/turf/turf.min.js'></script>
<script type="text/javascript" src="components/com_pvdemos/assets/js/main.js"></script>