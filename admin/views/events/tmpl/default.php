<?php
defined('_JEXEC') or die('Restricted access');

$pagination = &$this->pagination;
$events     = &$this->events;
$workers    = &$this->workers;

$workers_array = [];
foreach ($workers as $key=>$worker) {
    $workers_array[$worker->id] = $worker;
}

?>
<form action="<?=JRoute::_('index.php?option=com_pvdemos');?>" method="post" name="adminForm" id="adminForm">
    <div id="editcell">
        <table class="adminlist">
            <thead>
                <tr>
                    <th width="1px">
                        <?=JText::_('ID');?>
                    </th>
                    <th width="1px">
                        <input type="checkbox" name="toggle" value="" onclick="checkAll(<?=count($events);?>);" />
                    </th>
                    <th width="1px">
                        P
                    </th>
                    <th width="3%">
                        <?=JText::_('PRECINCT');?>
                    </th>
                    <th width="7%">
                        <?=JText::_('START');?>
                    </th>
                    <th width="7%">
                        <?=JText::_('END');?>
                    </th>
                    <th width="12%">
                        <?=JText::_('EVENT NAME');?>
                    </th>
                    <th width="12%">
                        <?=JText::_('ORGANIZATION NAME');?>
                    </th>
                    <th width="12%">
                        <?=JText::_('LOCATION NAME');?>
                    </th>
                    <th width="10%">
                        <?=JText::_('ADDRESS');?>
                    </th>
                    <th width="10%">
                        <?=JText::_('CONTACT');?>
                    </th>
                    <th width="15px">
                        <?=JText::_('GEOCODED');?>
                    </th>
                    <th width="15px">
                        <?=JText::_('ADA COMPLIANT');?>
                    </th>
                    <th width="15px">
                        <?=JText::_('SPECIAL BALLOT');?>
                    </th>
                    <th width="7%">
                        <?=JText::_('SCHEDULER');?>
                    </th>
                    <th width="auto">
                        &nbsp;
                    </th>
                </tr>
            </thead>
            <tbody>
            <?php
$k = 0;
for ($i = 0, $n = count($events); $i < $n; $i++) {
    $row     = &$events[$i];
    $checked = JHTML::_('grid.id', $i, $row->id);
    $published = JHTML::_('grid.published', $row, $i);
    $link = JRoute::_('index.php?option=com_pvdemos&controller=event&task=edit&cid[]='.$row->id);

            ?>
                <tr class="<?="row$k";?>">
                    <td>
                        <?=$row->id;?>
                    </td>
                    <td>
                        <?=$checked;?>
                    </td>
                    <td>
                        <?=$published;?>
                    </td>
                    <td>
                        <?=$row->precinct ? $row->precinct : '?';?>
                    </td>
                    <td>
                        <?=$row->start;?>
                    </td>
                    <td>
                        <?=$row->end;?>
                    </td>
                    <td>
                        <a href="<?=$link?>"><?=$row->event_name;?></a>
                    </td>
                    <td>
                        <a href="<?=$link?>"><?=$row->organization_name;?></a>
                    </td>
                    <td>
                        <a href="<?=$link?>"><?=$row->location_name;?></a>
                    </td>
                    <td>
                        <?=$row->street_address;?>
                    </td>
                    <td>
                        <?=$row->contact;?>
                    </td>
                    <td>
                        <?=$row->lat > 0 ? "Yes" : "No";?>
                    </td>
                    <td>
                        <?=$row->ada_confirmed ? "Yes" : "No";?>
                    </td>
                    <td>
                        <?=$row->special_ballot_needed ? "Yes" : "No";?>
                    </td>
                    <td>
                        <?=$workers_array[$row->scheduler_id]->name;?>
                    </td>
                    <td>
                        &nbsp;
                    </td>
                </tr>
            <?php
$k = 1 - $k;
}
?>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="16"><?php echo $pagination->getListFooter(); ?></td>
                </tr>
            </tfoot>
        </table>
    </div>
    <?=JHTML::_('form.token');?>
    <input type="hidden" name="task" value="" />
    <input type="hidden" name="boxchecked" value="0" />
    <input type="hidden" name="controller" value="event" />
    <?=JHTML::_('form.token');?>
</form>
