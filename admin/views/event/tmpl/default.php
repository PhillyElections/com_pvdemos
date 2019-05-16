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
d($event);
?>
<form action="<?=JRoute::_('index.php?option=com_pvdemos');?>" method="post" id="adminForm" name="adminForm" class="form-validate">
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
                        <?=JText::_('PUBLISHED');?>:
                    </label>
                </td>
                <td>
                    <?php echo JHTML::_('select.booleanlist', 'ada_compliant', 'class="inputbox"', $event->ada_compliant); ?>
                </td>
            </tr>
             <tr>
                <td width="200" height="30">
                    <label id="special_ballot_neededmsg" for="special_ballot_needed">
                        <?=JText::_('PUBLISHED');?>:
                    </label>
                </td>
                <td>
                    <?php echo JHTML::_('select.booleanlist', 'special_ballot_needed', 'class="inputbox"', $event->special_ballot_needed); ?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="special_ballot_worker_idmsg" for="special_ballot_worker_id">
                        <?=JText::_('FIELD');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', 'Select an filer class'), 'special_ballot_worker_id', '', 'idx', 'value', ($row->special_ballot_worker_id ? $row->special_ballot_worker_id : ''), 'classspecial_ballot_worker_id');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="staffer1_idmsg" for="staffer1_id">
                        <?=JText::_('FIELD');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', 'Select an filer class'), 'staffer1_id', '', 'idx', 'value', ($row->staffer1_id ? $row->staffer1_id : ''), 'staffer1_id');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="staffer2_idmsg" for="staffer2_id">
                        <?=JText::_('FIELD');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', 'Select an filer class'), 'staffer2_id', '', 'idx', 'value', ($row->staffer2_id ? $row->staffer2_id : ''), 'staffer2_id');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="staffer3_idmsg" for="staffer3_id">
                        <?=JText::_('FIELD');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', 'Select an filer class'), 'staffer3_id', '', 'idx', 'value', ($row->staffer3_id ? $row->staffer3_id : ''), 'staffer3_id');?>
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
