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
$item = !$this->isNew ? $this->item : JRequest::get('post');

?>
<form action="<?=JRoute::_('index.php?option=com_pvdemos');?>" method="post" id="adminForm" name="adminForm" class="form-validate">
    <table cellpadding="0" cellspacing="0" border="0" class="adminform">
        <tbody>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="secheduler_id">
                        <?=JText::_('SCHEDULER');?>:
                    </label>
                </td>
                <td>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($this->workers, 'id', 'name', 'Select scheduler'), 'scheduler_id', '', 'idx', 'value', ($item->scheduler_id ? $item->scheduler_id : ''), 'scheduler_id');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="field">
                        <?=JText::_('TIMES');?>:
                    </label>
                </td>
                <td>
                    <span> Day: <?php echo JHTML::_ ( 'calendar', date("Y-m-d", strtotime($item->start)), "day", "day", 'style="width:20px"' );?></span>
                    <<?=JHTML::_('select.genericlist', PVCombo::getsFromObject($hours, 'id', 'name'), 'start_hour', '', 'idx', 'value', ($item->start_hour ? $item->start_hour : '01'), 'start_hour');?>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($minutes, 'id', 'name'), 'start_minute', '', 'idx', 'value', ($item->start_minute ? $item->start_minute : '00'), 'start_minute');?>
                    <?=JHTML::_('select.genericlist', PVCombo::getsFromObject($am_pms, 'id', 'name'), 'start_am_pm', '', 'idx', 'value', ($item->am_pm ? $item->am_pm : 'PM'), 'am_pm');?>
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="name">
                        <?=JText::_('EVENT NAME');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="name" name="name" size="62" value="<?=$item->name ? $item->name : $item['name'];?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('EVENT NAME PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="location">
                        <?=JText::_('LOCATION NAME');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="location" name="location" size="62" value="<?=$item->location ? $item->location : $item['location'];?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('LOCATION NAME PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="street_address">
                        <?=JText::_('STREET ADDRESS');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="street_address" name="street_address" size="62" value="<?=$item->street_address ? $item->street_address : $item['street_address'];?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('STREET ADDRESS PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="contact">
                        <?=JText::_('CONTACT');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="contact" name="contact" size="62" value="<?=$item->contact ? $item->contact : $item['contact'];?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('CONTACT PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="phone">
                        <?=JText::_('PHONE');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="phone" name="phone" size="62" value="<?=$item->phone ? $item->phone : $item['phone'];?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('PHONE PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="email">
                        <?=JText::_('EMAIL');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="email" name="email" size="62" value="<?=$item->email ? $item->email : $item['email'];?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('EMAIL PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td height="30">&nbsp;</td>
                <td>
                    <button class="button validate" type="submit"><?=$this->isNew ? JText::_('SUBMIT') : JText::_('UPDATE');?></button>
                    <input type="hidden" name="task" value="<?=$this->isNew ? 'save' : 'update';?>" />
                    <input type="hidden" name="controller" value="item" />
                    <input type="hidden" name="id" value="<?=$item->id;?>" />
                    <?=JHTML::_('form.token');?>
                </td>
            </tr>
        </tbody>
    </table>
</form>
