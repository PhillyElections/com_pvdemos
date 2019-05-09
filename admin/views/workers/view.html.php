<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Workers View for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosViewWorkers extends JView
{
    /**
     * Workers view display method
     * @return void
     **/
    public function display($tpl = null)
    {
        JToolBarHelper::title(JText::_('PvDemos Workers Manager'), 'generic.png');
        JToolBarHelper::deleteList();
        JToolBarHelper::editListX();
        JToolBarHelper::addNewX();

        d($this);
        $workers      = &$this->get('Data');
        $pagination = &$this->get('Pagination');

        $this->assignRef('workers', $workers);
        $this->assignRef('pagination', $pagination);

        parent::display($tpl);
    }
}
