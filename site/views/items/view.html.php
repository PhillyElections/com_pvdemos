<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Items View for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license        GNU/GPL
 */
class PvdemosViewItems extends JView
{
    /**
     * Items view display method
     * @return void
     **/
    public function display($tpl = null)
    {
        $items      = &$this->get('Data');
        $pagination = &$this->get('Pagination');

        $this->assignRef('items', $items);
        $this->assignRef('pagination', $pagination);

        parent::display($tpl);
    }
}
