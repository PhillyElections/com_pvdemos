<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Events View for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosViewEvents extends JView
{
    /**
     * Events view display method
     * @return void
     **/
    public function display($tpl = null)
    {
        JToolBarHelper::title(JText::_('PvDemos Events Manager'), 'generic.png');
        JToolBarHelper::deleteList();
        JToolBarHelper::editListX();
        JToolBarHelper::addNewX();

        d($this);
        $events     = &$this->get('Data');
        $pagination = &$this->get('Pagination');

        $this->assignRef('events', $events);
        $this->assignRef('pagination', $pagination);

        parent::display($tpl);
    }
}
